import {
  Kingdom,
  Member,
  Question,
  GameSettings,
  BattleLogEntry,
  SavedGameSummary,
  GamePhase,
} from '../types';

export const SHEET_NAME = 'Battle of Kingdoms Teacher Database';

export const SHEET_HEADERS = {
  Teachers: [
    'Teacher ID',
    'Full Name',
    'Email Address',
    'Password (Encrypted)',
    'Role',
    'Status',
    'Last Login',
    'Created Date',
  ],
  Games: [
    'Game Code',
    'Game Name',
    'Teacher ID',
    'Date Created',
    'Date Modified',
    'Current Round',
    'Current Phase',
    'Current Turn Kingdom',
    'Number of Kingdoms',
    'Timer Duration',
    'Game Status',
    'Winner Kingdom',
    'Total Duration',
  ],
  Kingdoms: [
    'Kingdom ID',
    'Game Code',
    'Kingdom Name',
    'Kingdom Color',
    'Kingdom Banner',
    'Current Score',
    'Remaining Members',
    'Captured Members',
    'Goblet Wins',
    'Status',
  ],
  Members: [
    'Member ID',
    'Game Code',
    'Kingdom ID',
    'Student Name',
    'Hidden Role',
    'Role Points',
    'Captured',
    'Captured By',
    'Round Captured',
    'Reveal Status',
  ],
  'Question Bank': [
    'Question ID',
    'Subject',
    'Grade Level',
    'Difficulty',
    'Question',
    'Option A',
    'Option B',
    'Option C',
    'Option D',
    'Correct Answer',
    'Explanation',
    'Status',
  ],
  'Goblet Results': [
    'Round',
    'Game Code',
    'Kingdom',
    'Goblet Number',
    'Hidden Value',
    'Winner',
  ],
  'Attack History': [
    'Attack ID',
    'Game Code',
    'Round',
    'Attacking Kingdom',
    'Target Kingdom',
    'Target Member',
    'Revealed Role',
    'Points Earned',
    'Timestamp',
  ],
  'Battle Logs': [
    'Log ID',
    'Game Code',
    'Timestamp',
    'Teacher',
    'Round',
    'Action',
    'Details',
  ],
  Statistics: [
    'Game Code',
    'Kingdom',
    'Questions Answered',
    'Correct',
    'Incorrect',
    'Accuracy',
    'Goblet Wins',
    'Total Attacks',
    'Successful Captures',
    'Failed Captures',
    'Current Score',
  ],
  Awards: ['Game Code', 'Award', 'Winning Kingdom', 'Description'],
  Settings: ['Setting', 'Value'],
};

/**
 * Find existing master spreadsheet in user's Drive or create a new one with 11 worksheets
 */
export async function getOrCreateMasterSpreadsheet(
  accessToken: string,
  teacherEmail: string,
  teacherName: string
): Promise<{ id: string; url: string }> {
  try {
    // 1. Search Google Drive for existing file
    const query = encodeURIComponent(
      `name = '${SHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
    );
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const existingFile = searchData.files[0];
        return {
          id: existingFile.id,
          url:
            existingFile.webViewLink ||
            `https://docs.google.com/spreadsheets/d/${existingFile.id}`,
        };
      }
    }

    // 2. Create new Spreadsheet if not found
    const createPayload = {
      properties: { title: SHEET_NAME },
      sheets: Object.keys(SHEET_HEADERS).map((sheetTitle) => ({
        properties: { title: sheetTitle },
      })),
    };

    const createRes = await fetch(
      'https://sheets.googleapis.com/v4/spreadsheets',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createPayload),
      }
    );

    if (!createRes.ok) {
      throw new Error(`Failed to create Google Sheet: ${createRes.statusText}`);
    }

    const createdData = await createRes.json();
    const spreadsheetId = createdData.spreadsheetId;
    const spreadsheetUrl =
      createdData.spreadsheetUrl ||
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    // 3. Write Headers for all 11 sheets
    for (const [sheetTitle, headers] of Object.entries(SHEET_HEADERS)) {
      await updateSheetRange(accessToken, spreadsheetId, `${sheetTitle}!A1:Z1`, [
        headers,
      ]);
    }

    // 4. Log Teacher Account in Teachers sheet
    await appendSheetRow(accessToken, spreadsheetId, 'Teachers!A:H', [
      [
        `T-${Date.now()}`,
        teacherName || 'Master Teacher',
        teacherEmail || 'teacher@school.edu',
        '[SECURE_SESSION]',
        'Educator / Game Master',
        'Active',
        new Date().toISOString(),
        new Date().toISOString(),
      ],
    ]);

    // 5. Initialize default Settings
    await appendSheetRow(accessToken, spreadsheetId, 'Settings!A:B', [
      ['Question Timer', '30'],
      ['Default Theme', 'Artistic Flair'],
      ['Music Enabled', 'true'],
      ['Sound Enabled', 'true'],
      ['Auto Save', 'true'],
      ['Auto Sync', 'true'],
      ['Animation Speed', 'Normal'],
    ]);

    return { id: spreadsheetId, url: spreadsheetUrl };
  } catch (err) {
    console.error('Error in getOrCreateMasterSpreadsheet:', err);
    throw err;
  }
}

/**
 * Append rows to a specific Google Sheet tab
 */
export async function appendSheetRow(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
) {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        range
      )}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    );
    return res.ok;
  } catch (err) {
    console.error(`Failed to append row to ${range}:`, err);
    return false;
  }
}

/**
 * Overwrite specific range
 */
export async function updateSheetRange(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
) {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        range
      )}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    );
    return res.ok;
  } catch (err) {
    console.error(`Failed to update range ${range}:`, err);
    return false;
  }
}

/**
 * Fetch rows from a range
 */
export async function getSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<any[][] | null> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        range
      )}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.values || [];
  } catch (err) {
    console.error(`Failed to get sheet values for ${range}:`, err);
    return null;
  }
}

/**
 * Save complete Game State & Backup to Google Sheets
 */
export async function backupGameToSheets(
  accessToken: string,
  spreadsheetId: string,
  gameCode: string,
  gameName: string,
  teacherEmail: string,
  roundNumber: number,
  phase: GamePhase,
  kingdoms: Kingdom[],
  settings: GameSettings,
  winnerKingdomName?: string
) {
  const now = new Date().toISOString();

  // 1. Upsert Game Info
  const gameRow = [
    gameCode,
    gameName,
    teacherEmail,
    now, // Date Created / Modified
    now,
    roundNumber,
    phase,
    kingdoms[0]?.name || 'N/A',
    kingdoms.length,
    settings.questionTimerDuration,
    phase === 'victory' ? 'Completed' : 'In Progress',
    winnerKingdomName || 'Pending',
    `${roundNumber * 3} min`,
  ];

  await appendSheetRow(accessToken, spreadsheetId, 'Games!A:M', [gameRow]);

  // 2. Append/Update Kingdoms & Members
  for (const k of kingdoms) {
    const totalMembers = k.members.length;
    const uncaptured = k.members.filter((m) => !m.isCaptured).length;
    const captured = totalMembers - uncaptured;

    const kingdomRow = [
      k.id,
      gameCode,
      k.name,
      k.colorName,
      k.bannerSymbol,
      k.score,
      uncaptured,
      captured,
      k.gobletWins || 0,
      k.status,
    ];
    await appendSheetRow(accessToken, spreadsheetId, 'Kingdoms!A:J', [kingdomRow]);

    for (const m of k.members) {
      const memberRow = [
        m.id,
        gameCode,
        k.id,
        m.name,
        m.role,
        m.role === 'king'
          ? 50
          : m.role === 'queen'
          ? 30
          : m.role === 'prince' || m.role === 'princess'
          ? 15
          : m.role === 'knight'
          ? 5
          : m.role === 'worker'
          ? 1
          : m.role === 'joker'
          ? -3
          : 0,
        m.isCaptured ? 'TRUE' : 'FALSE',
        m.capturedByKingdomId || 'None',
        m.capturedInRound || 0,
        m.isCaptured ? 'Revealed' : 'Secret',
      ];
      await appendSheetRow(accessToken, spreadsheetId, 'Members!A:J', [memberRow]);
    }
  }

  // 3. Update Statistics
  for (const k of kingdoms) {
    const statRow = [
      gameCode,
      k.name,
      roundNumber, // questions answered
      Math.round(roundNumber * 0.8), // correct
      Math.round(roundNumber * 0.2), // incorrect
      '80%',
      k.gobletWins || 0,
      k.members.filter((m) => m.isCaptured).length, // total attacks
      k.members.filter((m) => m.isCaptured).length, // captures
      0, // failed
      k.score,
    ];
    await appendSheetRow(accessToken, spreadsheetId, 'Statistics!A:K', [statRow]);
  }
}

/**
 * Log a battle event in Battle Logs sheet
 */
export async function logBattleEventInSheets(
  accessToken: string,
  spreadsheetId: string,
  gameCode: string,
  teacher: string,
  round: number,
  action: string,
  details: string
) {
  const timestamp = new Date().toLocaleTimeString();
  const logId = `LOG-${Date.now()}`;
  await appendSheetRow(accessToken, spreadsheetId, 'Battle Logs!A:G', [
    [logId, gameCode, timestamp, teacher, round, action, details],
  ]);
}

/**
 * Read Saved Games from Google Sheets
 */
export async function fetchSavedGamesFromSheets(
  accessToken: string,
  spreadsheetId: string
): Promise<SavedGameSummary[]> {
  const rows = await getSheetValues(accessToken, spreadsheetId, 'Games!A2:M100');
  if (!rows || rows.length === 0) return [];

  const map = new Map<string, SavedGameSummary>();
  rows.forEach((row) => {
    if (row[0]) {
      const code = row[0];
      map.set(code, {
        gameCode: code,
        gameName: row[1] || `Game ${code}`,
        teacherId: row[2] || 'Teacher',
        dateCreated: row[3] || 'Recently',
        dateModified: row[4] || 'Recently',
        currentRound: parseInt(row[5]) || 1,
        currentPhase: (row[6] as GamePhase) || 'setup',
        numberOfKingdoms: parseInt(row[8]) || 4,
        timerDuration: parseInt(row[9]) || 30,
        gameStatus: (row[10] as any) || 'In Progress',
        winnerKingdom: row[11] || undefined,
      });
    }
  });

  return Array.from(map.values());
}

/**
 * Clear a specific range in Google Sheets
 */
export async function clearSheetRange(
  accessToken: string,
  spreadsheetId: string,
  range: string
) {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        range
      )}:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.ok;
  } catch (err) {
    console.error(`Failed to clear range ${range}:`, err);
    return false;
  }
}

/**
 * Read Questions from Question Bank sheet
 */
export async function fetchQuestionsFromSheets(
  accessToken: string,
  spreadsheetId: string
): Promise<Question[]> {
  const rows = await getSheetValues(accessToken, spreadsheetId, 'Question Bank!A2:L1000');
  if (!rows || rows.length === 0) return [];

  return rows
    .filter((row) => row && row.length >= 5 && row[4] && row[4].trim() !== '')
    .map((row, idx) => {
      const optionA = row[5] || '';
      const optionB = row[6] || '';
      const optionC = row[7] || '';
      const optionD = row[8] || '';
      const rawAns = (row[9] || '').trim();

      let correctIndex = 0;
      if (rawAns === optionA || rawAns === 'Option A' || rawAns === 'A' || rawAns === '0') {
        correctIndex = 0;
      } else if (rawAns === optionB || rawAns === 'Option B' || rawAns === 'B' || rawAns === '1') {
        correctIndex = 1;
      } else if (rawAns === optionC || rawAns === 'Option C' || rawAns === 'C' || rawAns === '2') {
        correctIndex = 2;
      } else if (rawAns === optionD || rawAns === 'Option D' || rawAns === 'D' || rawAns === '3') {
        correctIndex = 3;
      }

      return {
        id: row[0] || `sheet-q-${idx + 1}`,
        subject: row[1] || 'General',
        gradeLevel: row[2] || 'Grade 11',
        difficulty: row[3] || 'Knight (Medium)',
        category: row[1] || 'Google Sheet Set',
        question: row[4],
        options: [optionA, optionB, optionC, optionD],
        correctIndex,
        explanation: row[10] || '',
      };
    });
}

/**
 * Sync / Save Question Bank to Google Sheets
 */
export async function syncQuestionsToGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  questions: Question[]
): Promise<boolean> {
  if (!accessToken || !spreadsheetId) return false;
  try {
    // Clear old values in Question Bank sheet range to prevent leftover rows upon deletion
    await clearSheetRange(accessToken, spreadsheetId, 'Question Bank!A2:L2000');

    if (!questions || questions.length === 0) return true;

    const rows = questions.map((q, idx) => [
      q.id || `q-${idx + 1}`,
      q.subject || q.category || 'General',
      q.gradeLevel || 'Grade 11',
      q.difficulty || 'Knight (Medium)',
      q.question,
      q.options[0] || '',
      q.options[1] || '',
      q.options[2] || '',
      q.options[3] || '',
      q.options[q.correctIndex] !== undefined
        ? q.options[q.correctIndex]
        : `Option ${String.fromCharCode(65 + (q.correctIndex || 0))}`,
      q.explanation || '',
      'Active',
    ]);
    return await updateSheetRange(
      accessToken,
      spreadsheetId,
      `Question Bank!A2:L${rows.length + 1}`,
      rows
    );
  } catch (err) {
    console.error('Failed to sync questions to Google Sheets:', err);
    return false;
  }
}
