import { NextRequest, NextResponse } from 'next/server';
import { extractTeamrToken, extractConnectedUserId } from '@/app/utils/auth';
import { ErrorCode } from '@/app/types/errors';
import { executeQuery } from '@/app/lib/db';
import { getUserRights } from '@/app/services/rightsService';
import { UserRight } from '@/app/types/rights';
import { fetchAllLicenseesByEmail } from '@/app/services/common';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = extractTeamrToken(request);
    if (!token) {
      return NextResponse.json({
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Authentication required'
        }
      }, { status: 401 });
    }

    // Récupérer l'utilisateur connecté
    const connectedUserId = extractConnectedUserId(request);
    if (!connectedUserId) {
      return NextResponse.json({
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'User ID not found'
        }
      }, { status: 401 });
    }

    // Vérifier que l'utilisateur a les droits ADMIN
    const userRights = await getUserRights(connectedUserId);
    const isAdmin = userRights.includes(UserRight.ADMIN);

    if (!isAdmin) {
      return NextResponse.json({
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Accès réservé aux administrateurs'
        }
      }, { status: 403 });
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const userIdFilter = searchParams.get('userId');
    const userNameFilter = searchParams.get('userName');
    const actionTypeFilter = searchParams.get('actionTypes'); // Format: "CONNEXION,ADD_BOOKING"
    const statusFilter = searchParams.get('status'); // SUCCESS ou FAILED
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    console.log('📥 GET /api/admin/action-logs - Paramètres:', { 
      userIdFilter, 
      userNameFilter, 
      actionTypeFilter, 
      statusFilter, 
      page, 
      limit, 
      offset 
    });

    // Construire la requête SQL de comptage
    let countQuery = 'SELECT COUNT(*) as total FROM action_log';
    const countParams: string[] = [];
    let paramIndex = 1;

    const whereConditions: string[] = [];

    if (userIdFilter) {
      whereConditions.push(`user_id = $${paramIndex}`);
      countParams.push(userIdFilter);
      paramIndex++;
    }

    if (actionTypeFilter) {
      const actionTypes = actionTypeFilter.split(',').filter(Boolean);
      if (actionTypes.length > 0) {
        const placeholders = actionTypes.map(() => `$${paramIndex++}`).join(', ');
        whereConditions.push(`action_type IN (${placeholders})`);
        countParams.push(...actionTypes);
      }
    }

    if (statusFilter) {
      whereConditions.push(`action_result = $${paramIndex}`);
      countParams.push(statusFilter);
      paramIndex++;
    }

    if (whereConditions.length > 0) {
      countQuery += ' WHERE ' + whereConditions.join(' AND ');
    }

    // Récupérer le nombre total de résultats
    const countResult = await executeQuery(countQuery, countParams);
    const total = parseInt(countResult[0]?.total || '0');

    // Construire la requête SQL de données
    let query = `
      SELECT 
        id,
        user_id,
        action_type,
        action_result,
        action_timestamp,
        action_details,
        created_at
      FROM action_log
    `;
    const params: (string | number)[] = [];
    let dataParamIndex = 1;

    const dataWhereConditions: string[] = [];

    if (userIdFilter) {
      dataWhereConditions.push(`user_id = $${dataParamIndex}`);
      params.push(userIdFilter);
      dataParamIndex++;
    }

    if (actionTypeFilter) {
      const actionTypes = actionTypeFilter.split(',').filter(Boolean);
      if (actionTypes.length > 0) {
        const placeholders = actionTypes.map(() => `$${dataParamIndex++}`).join(', ');
        dataWhereConditions.push(`action_type IN (${placeholders})`);
        params.push(...actionTypes);
      }
    }

    if (statusFilter) {
      dataWhereConditions.push(`action_result = $${dataParamIndex}`);
      params.push(statusFilter);
      dataParamIndex++;
    }

    if (dataWhereConditions.length > 0) {
      query += ' WHERE ' + dataWhereConditions.join(' AND ');
    }

    query += ` ORDER BY action_timestamp DESC LIMIT $${dataParamIndex} OFFSET $${dataParamIndex + 1}`;
    params.push(limit, offset);

    // Exécuter la requête
    const rows = await executeQuery(query, params);

    // Récupérer les informations utilisateur pour tous les userIds uniques
    const uniqueUserIds = [...new Set(rows.map((row: any) => row.user_id))];
    const licenseeMap = await fetchAllLicenseesByEmail(token);
    
    // Créer un map userId -> { firstName, lastName }
    const userInfoMap = new Map<string, { firstName: string; lastName: string }>();
    
    // Pour chaque userId, chercher dans les licenciés
    for (const userId of uniqueUserIds) {
      // Chercher dans la map des licenciés par email (on va devoir faire une recherche inverse)
      for (const [email, licensee] of licenseeMap.entries()) {
        if (licensee.user[0]?._id === userId) {
          userInfoMap.set(userId, {
            firstName: licensee.user[0].firstName,
            lastName: licensee.user[0].lastName
          });
          break;
        }
      }
    }

    // Transformer les résultats avec les informations utilisateur
    let actionLogs = rows.map((row: any) => {
      const userInfo = userInfoMap.get(row.user_id);
      return {
        id: row.id,
        userId: row.user_id,
        userFirstName: userInfo?.firstName || 'Inconnu',
        userLastName: userInfo?.lastName || 'Utilisateur',
        actionType: row.action_type,
        actionResult: row.action_result,
        actionTimestamp: row.action_timestamp,
        actionDetails: row.action_details,
        createdAt: row.created_at
      };
    });

    // Appliquer le filtre par nom si fourni
    if (userNameFilter) {
      const filterLower = userNameFilter.toLowerCase();
      actionLogs = actionLogs.filter(log => 
        log.userFirstName.toLowerCase().includes(filterLower) ||
        log.userLastName.toLowerCase().includes(filterLower)
      );
    }

    console.log('📤 GET /api/admin/action-logs - Résultat:', actionLogs.length, 'logs sur', total, 'total');

    return NextResponse.json({
      data: actionLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des action logs:', error);
    return NextResponse.json({
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Erreur lors de la récupération des logs'
      }
    }, { status: 500 });
  }
}

