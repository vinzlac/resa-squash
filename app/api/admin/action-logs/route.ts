import { NextRequest, NextResponse } from 'next/server';
import { extractTeamrToken, extractConnectedUserId } from '@/app/utils/auth';
import { ErrorCode } from '@/app/types/errors';
import { executeQuery } from '@/app/lib/db';
import { getUserRights } from '@/app/services/rightsService';
import { UserRight } from '@/app/types/rights';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    console.log('📥 GET /api/admin/action-logs - Paramètres:', { userIdFilter, page, limit, offset });

    // Construire la requête SQL de comptage
    let countQuery = 'SELECT COUNT(*) as total FROM action_log';
    const countParams: string[] = [];

    if (userIdFilter) {
      countQuery += ' WHERE user_id = $1';
      countParams.push(userIdFilter);
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

    if (userIdFilter) {
      query += ' WHERE user_id = $1';
      params.push(userIdFilter);
      query += ` ORDER BY action_timestamp DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` ORDER BY action_timestamp DESC LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }

    // Exécuter la requête
    const rows = await executeQuery(query, params);

    // Transformer les résultats
    const actionLogs = rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      actionType: row.action_type,
      actionResult: row.action_result,
      actionTimestamp: row.action_timestamp,
      actionDetails: row.action_details,
      createdAt: row.created_at
    }));

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

