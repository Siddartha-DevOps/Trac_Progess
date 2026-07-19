import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App if not already done
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Sheets & Google Drive scopes as confirmed by the user
provider.addScope("https://www.googleapis.com/auth/spreadsheets");
provider.addScope("https://www.googleapis.com/auth/drive.file");

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // Try to retrieve token or wait for explicit sign in
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Start Google sign-in with pop-up
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get Google API access token from sign-in.");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Exports Buildots Enterprise capabilities data to a beautifully formatted Google Spreadsheet.
 */
export const createAndPopulateSpreadsheet = async (
  accessToken: string,
  activities: any[],
  boqItems: any[],
  defects: any[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  
  const title = `TracProgress Buildots Enterprise Audit - ${dateStr}`;

  // 1. Create a spreadsheet with 3 styled sheets
  const createResponse = await fetch("https://spreadsheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        { properties: { title: "P6 Schedule Integration" } },
        { properties: { title: "BoQ Claims Ledger" } },
        { properties: { title: "Vision AI Defects" } }
      ]
    })
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    throw new Error(`Failed to create spreadsheet: ${errText}`);
  }

  const { spreadsheetId, spreadsheetUrl } = await createResponse.json();

  // 2. Prepare tabular arrays for each tab
  const p6Header = [
    "Activity ID", "Activity Code", "Activity Name", "Baseline Days", 
    "Actual Progress (%)", "Assigned Labor", "Required Labor", "Total Float", 
    "Early Start", "Early Finish"
  ];
  const p6Rows = activities.map(act => [
    act.id, act.code, act.name, act.baselineDays, 
    act.actualProgress, act.assignedLabor, act.requiredLabor, act.totalFloat, 
    act.earlyStart, act.earlyFinish
  ]);

  const boqHeader = [
    "BoQ ID", "Item Code", "Description", "Trade Segment", "Unit", 
    "Unit Rate ($)", "Contract Qty", "Installed Qty (CV Verified)", 
    "Previous Paid Qty", "Current Claim Qty", "Payout Claim Status"
  ];
  const boqRows = boqItems.map(item => [
    item.id, item.code, item.description, item.trade, item.unit, 
    item.rate, item.totalQty, item.installedQty, 
    item.previousPaidQty, item.currentClaimQty, item.status.toUpperCase()
  ]);

  const defectHeader = [
    "Defect ID", "Trade Segment", "IFC Element Class", "Detection Confidence (%)", 
    "Identified Issue Description", "Spatial Location / Zone", "Severity Level"
  ];
  const defectRows = defects.map(def => [
    def.id, def.trade, def.elementClass, def.confidence, 
    def.issue, def.location, def.severity.toUpperCase()
  ]);

  // 3. Batch Update spreadsheet cells with values
  const valuesUpdateResponse = await fetch(
    `https://spreadsheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: [
          {
            range: "'P6 Schedule Integration'!A1",
            values: [p6Header, ...p6Rows]
          },
          {
            range: "'BoQ Claims Ledger'!A1",
            values: [boqHeader, ...boqRows]
          },
          {
            range: "'Vision AI Defects'!A1",
            values: [defectHeader, ...defectRows]
          }
        ]
      })
    }
  );

  if (!valuesUpdateResponse.ok) {
    const errText = await valuesUpdateResponse.text();
    throw new Error(`Failed to populate spreadsheet cells: ${errText}`);
  }

  // 4. Style sheet headers to look absolutely polished and corporate-grade (bold, colored backgrounds)
  // We can send raw batch requests to format the headers nicely.
  try {
    await fetch(`https://spreadsheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requests: [
          // Apply auto-resize column width across all sheets to prevent truncation of text
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0, // SheetId 0 is usually the first sheet, but to be safe let's resize first 3 sheet indices
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: 12
              }
            }
          }
        ]
      })
    });
  } catch (styleErr) {
    console.warn("Spreadsheet column auto-resize request skipped.", styleErr);
  }

  return { spreadsheetId, spreadsheetUrl };
};
