const state = { screens: [], nav: [], panel: "CLIENT", screenId: "CLIENT-01", sidebarOpen: false, formMode: null, formAction: "", formStep: 1, formDirty: false, directory: false, flowView: null, permissionOpenModules: ["Administration"], panelNavGroup: { CLIENT:"Home", SUPPORT:"Operations", ADMIN:"Home" } };

const iconPaths = {
  dashboard: '<path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z"/>',
  ticket: '<path d="M4 4h16v5a3 3 0 0 0 0 6v5H4v-5a3 3 0 0 0 0-6V4Z"/><path d="M9 4v16"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7Z"/><path d="M10 20h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  report: '<path d="M5 3h11l3 3v15H5V3Z"/><path d="M8 16v-4m4 4V8m4 8v-6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
  shield: '<path d="M12 2 20 5v6c0 5-3 8-8 11-5-3-8-6-8-11V5l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  people: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20c1-5 3-7 6-7s5 2 6 7m0-5c3 0 5 2 6 5"/>',
  contract: '<path d="M6 2h9l4 4v16H6V2Z"/><path d="M14 2v5h5M9 12h7m-7 4h7"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  warning: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5m0 3v1"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  logout: '<path d="M10 4H4v16h6m4-4 4-4-4-4m-6 4h10"/>'
};
function icon(name, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.ticket}</svg>`;
}
function iconFor(label) {
  const x = String(label || "").toLowerCase();
  if (x.includes("dashboard") || x.includes("overview")) return "dashboard";
  if (x.includes("ticket") || x.includes("work")) return "ticket";
  if (x.includes("contract") || x.includes("hour")) return "contract";
  if (x.includes("notification")) return "bell";
  if (x.includes("profile") || x.includes("user") || x.includes("team") || x.includes("client")) return "people";
  if (x.includes("report") || x.includes("audit")) return "report";
  if (x.includes("setting") || x.includes("configuration") || x.includes("integration")) return "settings";
  if (x.includes("control") || x.includes("retention") || x.includes("health")) return "shield";
  if (x.includes("search")) return "search";
  return "ticket";
}

function parseCSV(text) {
  const rows = []; let row = []; let field = ""; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ""; }
    else if (ch === '\n') { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift().map(h => h.replace(/^\uFEFF/, ""));
  return rows.filter(r => r.some(Boolean)).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] || ""])));
}
const split = value => (value || "").split(/\s*;\s*/).filter(Boolean);
const esc = value => String(value || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const mutationActionPattern = /create|add|edit|invite|copy|correct|correction|change|assign|link|configure|define|save|submit|upload|publish|activate|deactivate|suspend|expire|approve|reject|return|request|execute|acknowledge|withdraw|resend|run|test|reorder|remove|confirm|escalate|reply|private note|restrict|disable|enable|set scope|start dispute|defer|mark |notify|record follow-up|process dispute|assess|retry|rotate|security escalation|end other sessions|favorite|choose default|bulk action|bulk decision/i;
const sentenceCase = value => value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
const conciseDescriptions = {
  "AUTH-01":"Sign in to your authorized workspace.",
  "AUTH-02":"Recover safely from blocked access.",
  "PROV-01":"Monitor service workload and risk.",
  "PROV-02":"Find and manage support tickets.",
  "PROV-03":"Log a ticket for a client.",
  "PROV-04":"Investigate and resolve the ticket.",
  "PROV-05":"Search all authorized support records.",
  "CLIENT-01":"Track your support activity.",
  "CLIENT-02":"View and follow your tickets.",
  "CLIENT-03":"Send a new support request.",
  "CLIENT-04":"Follow updates and reply safely.",
  "CLIENT-05":"Review approved hour movements.",
  "CLIENT-06":"Challenge an approved hour entry.",
  "CLIENT-07":"Review contracts and available hours.",
  "CLIENT-08":"Manage your organization’s users.",
  "ORG-01":"Manage client organizations.",
  "ORG-02":"Review one client account.",
  "ORG-03":"Manage client users and access.",
  "ORG-04":"Manage provider users and roles.",
  "APP-01":"Manage supported client applications.",
  "TEAM-01":"Manage teams, skills, and capacity.",
  "RULE-01":"Control routing and priority rules.",
  "CONT-01":"Track contracts and urgent alerts.",
  "CONT-02":"Review contract terms and versions.",
  "CONT-03":"Define covered services and exclusions.",
  "CONT-04":"Reconcile approved support-hour movements.",
  "CONT-05":"Decide exceptions and overage requests.",
  "CONT-06":"Manage renewals and expiry risks.",
  "SLA-01":"Define response and resolution targets.",
  "SLA-02":"Test SLA timing before publishing.",
  "SLA-03":"Manage working hours and holidays.",
  "SLA-04":"Act before SLA targets breach.",
  "WL-01":"Record time spent on support.",
  "WL-02":"Review submitted support worklogs.",
  "WL-03":"Track your own worklogs.",
  "NOTIF-01":"Review updates that need attention.",
  "AUD-01":"Trace important system changes.",
  "RET-01":"Control retention and deletion safely.",
  "OPS-01":"Monitor recovery and platform health.",
  "OPS-00":"Review operational health and compliance status.",
  "INT-01":"Manage connected channels and services.",
  "INT-02":"Resolve failed email intake.",
  "REP-01":"Analyze SLA performance and breaches.",
  "REP-02":"Analyze support-hour consumption.",
  "REP-03":"Analyze tickets and service trends.",
  "REP-00":"Open available operational reports.",
  "SET-01":"Configure taxonomy and ticket lifecycle.",
  "SET-02":"Manage approved response templates.",
  "SET-00":"Manage service configuration areas.",
  "PROFILE-01":"Manage your profile and preferences.",
  "APR-01":"Review decisions assigned to you.",
  "ADMIN-01":"Monitor administrative setup and risk.",
  "IAM-01":"Define reusable access roles.",
  "IAM-02":"Compare permissions by role.",
  "IAM-03":"Review access requests and recertification.",
  "IAM-04":"Track and manage user invitations.",
  "DEPT-01":"Manage support departments and ownership.",
  "ISSUE-01":"Manage issue types and categories."
};
function conciseDescription(screen) {
  return conciseDescriptions[screen.screen_id] || `Manage ${String(screen.screen_name || "this screen").toLowerCase()}.`;
}
const ticketListScreens = new Set(["CLIENT-01", "CLIENT-02", "PROV-01", "PROV-02", "SLA-04"]);
function workflowTitle(createTitle, editTitle) {
  const action = (state.formAction || "").trim();
  if (action && !/^(create|add|edit)$/i.test(action)) return sentenceCase(action);
  return state.formMode === "edit" ? editTitle : createTitle;
}

const formFirstScreens = new Set(["PROV-03", "CLIENT-03", "WL-01", "PROFILE-01"]);
const formCapableScreens = new Set([
  ...formFirstScreens, "ORG-01", "ORG-02", "ORG-03", "ORG-04", "CLIENT-08", "APP-01", "TEAM-01", "RULE-01",
  "CONT-01", "CONT-02", "CONT-03", "CONT-04", "SLA-01", "SLA-02", "SLA-03", "WL-03",
  "SET-01", "SET-02", "INT-01", "RET-01", "IAM-01", "IAM-02", "IAM-03", "IAM-04", "DEPT-01", "ISSUE-01"
]);
function formSpec(screen) {
  const id = screen.screen_id;
  const action = (state.formAction || "").toLowerCase();
  if (["PROV-03", "CLIENT-03"].includes(id) || action.includes("create ticket") || action.includes("create draft after verification")) {
    const clientTicket = id.startsWith("CLIENT") || state.panel === "CLIENT";
    return {
    title: clientTicket ? "Submit support ticket" : "Create ticket for client",
    sections: [
      ["Request context", [["Client organization",clientTicket ? "readonly" : "select","Northstar Retail",clientTicket ? "Linked to signed-in account" : "Required"],["Verified requester",clientTicket ? "readonly" : "select","Maya Chen — maya@northstar.example",clientTicket ? "Current signed-in user" : "Required"],["Supported application","select","Commerce API","Required"],["Request source","readonly",clientTicket ? "Client portal" : action.includes("verification") ? "Verified email exception" : "Phone call","Captured automatically"]]],
      ["Issue classification", [["Request type","select","Incident","Required"],["Category","select","Payments","Filtered by request type"],["Issue type","select","Payment processing failure","Filtered by category"],["Subtype","select","Callback not received","Shown only when available"]]],
      ["Impact and priority", [["Business impact","select","Multiple users blocked","Required"],["Urgency","select","High — workaround unavailable","Required"],["Calculated priority","readonly","P2 — High","Calculated automatically"],["Routing preview","readonly","Application Support → Payment queue","Calculated automatically"]]],
      ["Issue details", [["Subject","text","Payment confirmation fails","Required · 8–120 characters"],["Description","textarea","Payment completes but the order remains pending. Started after the 09:30 deployment.","Required · include expected and actual behavior"],["Environment","select","Production","Required"],["Affected service","select","Payment confirmation API","Required by issue type"],["Occurrence time","datetime","2026-10-18 09:30","Required for incidents"],["Frequency","select","Every payment attempt","Required for incidents"],["Related release","text","Release 4.18.2","Conditional field"]]],
      ["Evidence and entitlement", [["Attachments","upload","Drop screenshots or log files here","Allowed types and malware scan apply"],["Contract","readonly","CON-2026-018 · Premium Support","Checked automatically"],["Coverage status","readonly","Covered · 31.5 hours available","Snapshot saved on submission"]]]
    ]
  };
  }
  if (id === "PROV-02") return { title: action.includes("queue") ? "Save ticket queue" : "Update ticket assignment and priority", sections: [
    ["Selection", [["Selected tickets","readonly","4 authorized tickets","Selection remains within access scope"],["Current queue","readonly","All authorized tickets","Source view"],["Change type","select",action.includes("assign") ? "Assign or reassign" : action.includes("priority") ? "Priority and status" : "Saved queue definition","Required"]]],
    ["Update", [["Owner or team","select","Application Support","Required for assignment"],["Priority","select","P2 — High","Impact and urgency rules apply"],["Status","select","In Progress","Only valid transitions"],["Saved queue name","text","My high-priority payment tickets","Required when saving a queue"]]],
    ["Governance", [["Reason","textarea","Workload balancing and current application ownership.","Required for bulk changes"],["Notify affected owners","toggle","Enabled","Optional"],["Change preview","readonly","4 tickets will be updated","Review before confirmation"]]]
  ]};
  if (id === "PROV-04" && action.includes("agent edit classification")) return { title: "Agent — update issue classification", sections: [
    ["Current classification", [["Ticket","readonly","ST-10482 — Payment confirmation fails","Current ticket"],["Current path","readonly","Incident › Payments › Processing failure › Callback not received","Published taxonomy"],["Assigned department","readonly","Application Support","Agents cannot override department ownership"],["Current priority","readonly","P2 — High","Calculated"]]],
    ["Agent classification update", [["Request type","select","Incident","Editable while ticket is open"],["Category","select","Payments","Published categories only"],["Issue type","select","Payment processing failure","Active types only"],["Subtype","select","Callback not received","Shown only when available"]]],
    ["Impact evidence", [["Affected service","select","Payment confirmation API","Required by issue type"],["Business impact","select","Multiple users blocked","Required"],["Urgency","select","High — workaround unavailable","Required"],["Agent evidence","textarea","Reproduced on three production transactions; no supported workaround is available.","Required for a classification change"],["Calculated result","readonly","P2 — High · Payment queue","Cannot be manually overridden by agent"],["Manager review","readonly","Required only for an override","Policy controlled"]]]
  ]};
  if (id === "PROV-04" && action.includes("manager review")) return { title: "Manager — review classification and routing", sections: [
    ["Change request", [["Ticket","readonly","ST-10482 — Payment confirmation fails","Current ticket"],["Requested by","readonly","Mahmoud Nader · Support agent","Recorded actor"],["Previous path","readonly","Incident › Payments › Processing failure › Callback not received","Retained in history"],["Proposed outcome","readonly","P1 — Critical · Engineering Escalation","Requires manager authority"]]],
    ["Manager decision", [["Classification decision","select","Approve with override","Approve, return, or reject"],["Support department","select","Engineering and Platform","Manager scope required"],["Assigned team","select","Engineering Escalation","Must belong to selected department"],["Priority override","select","P1 — Critical","Reason required"],["SLA policy","select","Premium Critical Incident SLA","Contract and authority checked"],["Escalation level","select","Level 2 — Management attention","Optional"]]],
    ["Governance", [["Override reason","textarea","Payment confirmation is unavailable across production channels and requires immediate engineering ownership.","Required for department, priority, or SLA override"],["Effective change","readonly","Department, team, priority, and SLA target will change","Before-and-after preview"],["Notify","multiselect","Ticket owner; Previous team; New team; Client contact","Client receives public-safe details only"],["Audit record","readonly","Actor, time, reason, old values, and new values","Saved automatically"],["Decision status","readonly","Pending confirmation","Duplicate decisions blocked"]]]
  ]};
  if (id === "PROV-04") return { title: action.includes("worklog") ? "Add worklog to ticket" : "Update ticket", sections: action.includes("worklog") ? [
    ["Work performed", [["Ticket","readonly","ST-10482 — Payment confirmation fails","Current ticket"],["Work date","date","2026-10-18","Open period required"],["Duration","duration","1 hour 15 minutes","Positive · no overlap"],["Activity type","select","Investigation and resolution","Required"]]],
    ["Details", [["Billable","toggle","Yes","Based on contract coverage"],["Work summary","textarea","Reviewed payment callbacks and corrected the signing-key reference.","Required"],["Evidence","upload","Attach internal evidence","Optional"]]]
  ] : [
    ["Ticket update", [["Ticket","readonly","ST-10482 — Payment confirmation fails","Current ticket"],["Status","select","In Progress","Only valid transitions"],["Assigned team","select","Application Support","Required"],["Assigned agent","select","Mahmoud Nader","Must belong to selected team"]]],
    ["Change context", [["Priority","select","P1 — Critical","Impact/urgency rules apply"],["Escalation level","select","Supervisor review","Optional"],["Reason","textarea","Production payment failure affects multiple customers.","Required for escalation or priority change"],["Notify client","toggle","Enabled","Public events only"]]]
  ]};
  if (id === "CLIENT-04") return { title: action.includes("reopen") ? "Request ticket reopen" : "Add client reply", sections: [
    ["Reply", [["Ticket","readonly","ST-10482 — Payment confirmation fails","Current ticket"],["Reply type","select",action.includes("reopen") ? "Reopen request" : "Public reply","Client visible"],["Message","textarea",action.includes("reopen") ? "The issue occurred again after the proposed resolution was applied." : "The issue still occurs for orders created after 14:00. Attached is a fresh screenshot.","Required"],["Attachment","upload","Add supporting file","File type, size, and scan rules apply"]]],
    ["Review", [["Requester","readonly","Maya Chen","Current user"],["Notification recipients","readonly","Assigned support team","Automatic"],["Submission state","readonly",action.includes("reopen") ? "Pending reopen review" : "Reply will be added","Review before send"]]]
  ]};
  if (id === "ORG-02" && action.includes("add user")) return { title: "Add record to client", sections: [
    ["Record type", [["Client","readonly","Northstar Retail","Current organization"],["Add","select","Client user","Choose user, application, or contract"],["Display name","text","Jordan Lee","Required"],["Reference or email","text","jordan.lee@northstar.example","Required"]]],
    ["Access or ownership", [["Role / service plan","select","Client user","Required"],["Application scope","multiselect","Commerce API; Customer Portal","Optional"],["Effective date","date","2026-10-20","Required"],["Owner","select","Maya Chen","Required"]]],
    ["Invitation and evidence", [["Send invitation","toggle","Enabled","For user records"],["Supporting document","upload","Attach contract when applicable","Conditional"],["Notes","textarea","New finance team contact with access to payment-related tickets.","Optional"]]]
  ]};
  if (id === "CONT-05") return { title: action.includes("information") ? "Request additional information" : action.includes("approve") || action.includes("reject") ? "Record exception decision" : "Submit exception or overage request", sections: [
    ["Request", [["Ticket","select","ST-10482 — Payment confirmation fails","Required"],["Client","readonly","Northstar Retail","Derived from ticket"],["Exception type","select","Support-hour overage","Required"],["Requested hours","number","6","Positive and within approval limit"]]],
    ["Business justification", [["Reason","textarea","Critical production incident requires work beyond the remaining contract balance.","Required"],["Operational impact","select","Payment processing unavailable","Required"],["Supporting evidence","upload","Attach incident evidence","Optional"],["Requested expiry","date","2026-10-21","Cannot precede request date"]]],
    ["Decision", [["Recommendation","select",action.includes("reject") ? "Reject" : "Approve with limit","Approver only"],["Approved limit","number","4","Cannot exceed authority"],["Decision rationale","textarea","Approve emergency restoration work; enhancement work remains excluded.","Required for decision"],["Notify","multiselect","Requester; Client administrator; Ticket owner","Based on visibility"]]]
  ]};
  if (id === "CONT-06") return { title: "Assign contract alert owner", sections: [
    ["Alert", [["Contract","readonly","CON-2026-011 · Gulf Health Group","Current alert"],["Alert type","readonly","Expires in 28 days","System generated"],["Current owner","readonly","Unassigned","Current state"]]],
    ["Assignment", [["Owner","select","Sarah Morgan","Required"],["Due date","date","2026-10-25","Before contract expiry"],["Next action","select","Start renewal review","Required"],["Internal note","textarea","Confirm renewal scope and unused-hour treatment with account owner.","Optional"]]]
  ]};
  if (id === "SLA-04") return { title: action.includes("escalation") ? "Execute SLA escalation" : "Assign SLA risk item", sections: [
    ["Risk item", [["Ticket","readonly","ST-10474 — Incorrect support-hour balance","Current item"],["SLA target","readonly","P1 resolution · 38 minutes remaining","Calculated"],["Current owner","readonly","Application Support","Current assignment"]]],
    ["Response", [["Assign to","select","Duty Manager","Required"],["Escalation level","select","Level 2 — Management attention","Required"],["Immediate action","textarea","Reallocate a senior agent and contact the client with a recovery update.","Required"],["Notify","multiselect","Supervisor; Duty manager; Client contact","Scope controlled"]]]
  ]};
  if (id === "WL-02") return { title: action.includes("correction") ? "Correct approved worklog" : "Review worklog", sections: [
    ["Worklog", [["Reference","readonly","WL-8492 · ST-10468","Current item"],["Agent","readonly","Omar Khalid","Submitted by"],["Logged duration","readonly","3 hours 30 minutes","Original value"],["Billable","readonly","Yes","Contract-derived"]]],
    ["Decision or correction", [["Decision","select",action.includes("return") ? "Return for correction" : "Approve","Required"],["Corrected duration","duration","3 hours","Policy permission required"],["Reason","textarea","Thirty minutes related to internal coordination and is not billable.","Required for return/correction"],["Notify agent","toggle","Enabled","Recommended"]]]
  ]};
  if (id === "OPS-01") return { title: action.includes("restore") ? "Request controlled restore" : "Run platform test", sections: [
    ["Operation", [["Environment","select","Production","Required"],["Operation type","select",action.includes("restore") ? "Database restore rehearsal" : "Backup integrity test","Required"],["Backup point","select","2026-10-18 02:00 UTC","Required"],["Execution window","datetime","2026-10-19 22:00","Approved maintenance window"]]],
    ["Controls", [["Reason","textarea","Quarterly recovery validation against the approved RPO/RTO scenario.","Required"],["Impact","select","Isolated recovery environment","Required"],["Primary approver","select","Operations manager","Required"],["Rollback plan","textarea","Destroy isolated environment after evidence capture; production remains unchanged.","Required"]]]
  ]};
  if (id === "INT-02") return { title: action.includes("draft") ? "Create verified ticket draft" : "Resolve email intake exception", sections: [
    ["Message", [["Message reference","readonly","MAIL-EX-2094","Current exception"],["Sender","readonly","maya@northstar.example","Unverified mapping"],["Proposed client","select","Northstar Retail","Required"],["Verified contact","select","Maya Chen","Required before ticket creation"]]],
    ["Resolution", [["Action","select",action.includes("reject") ? "Reject and quarantine" : action.includes("ticket") ? "Link existing ticket" : "Create ticket draft","Required"],["Ticket reference","text","ST-10482","Required when linking"],["Category","select","Incident > Payments","Required for draft"],["Reason / note","textarea","Sender domain and contact identity verified against the client registry.","Required"]]],
    ["Security", [["Attachment handling","select","Scan and retain allowed files","Required"],["Security escalation","toggle","Disabled","Enable for suspicious content"],["Audit evidence","readonly","Original headers and message hash retained","Automatic"]]]
  ]};
  if (id === "ADMIN-01") return { title: "Quick-create administration record", sections: [
    ["Record type", [["Create","select","Client organization","Choose client or provider user"],["Name","text","Northstar Retail","Required"],["Primary identifier","text","NSR-042","Required · unique"],["Owner","select","Sarah Morgan","Required"]]],
    ["Initial access", [["Primary contact email","email","maya@northstar.example","Required for client"],["Initial role","select","Client administrator","Required for user"],["Status","select","Draft pending review","Required"],["Send invitation","toggle","Disabled","Available after validation"]]],
    ["Review", [["Reason","textarea","New enterprise client onboarding approved under sales handover SH-884.","Required"],["Evidence","upload","Attach approved onboarding record","Required"]]]
  ]};
  if (["ORG-01","ORG-02"].includes(id)) return { title: workflowTitle("Create client organization", "Edit client organization"), sections: [
    ["Organization identity", [["Legal name","text","Northstar Retail W.L.L.","Required"],["Display name","text","Northstar Retail","Required"],["Client code","text","NSR-042","Unique · uppercase"],["Status","select","Active","Required"]]],
    ["Primary contact", [["Contact name","text","Maya Chen","Required"],["Business email","email","maya@northstar.example","Required · verified domain"],["Phone","text","+973 1700 2211","Include country code"],["Time zone","select","Asia/Bahrain","Required"]]],
    ["Access and governance", [["Allowed email domains","text","northstar.example","Required for invitation checks"],["Default language","select","English","Required"],["Data region","select","Bahrain","Policy controlled"],["Internal owner","select","Sarah Morgan","Required"]]]
  ]};
  if (["ORG-03","ORG-04"].includes(id) && action.includes("disable")) return { title: "Disable user access", sections: [
    ["User and impact", [["User","readonly","Jordan Lee · jordan.lee@northstar.example","Current user"],["Current roles","readonly",id === "ORG-03" ? "Client administrator" : "Support agent; Queue editor","Access to be removed"],["Open ownership","readonly","6 open tickets · 2 pending approvals","Must be reassigned"],["Critical-role check","readonly","Another active administrator exists","Cannot disable the last administrator"]]],
    ["Access termination", [["Effective time","datetime","2026-10-18 17:00","Required"],["Reassign tickets to","select","Application Support queue","Required when work is owned"],["Reassign approvals to","select","Lina Ahmed","Required when approvals exist"],["End active sessions","toggle","Enabled","Recommended"]]],
    ["Decision evidence", [["Reason category","select","Employment or access change","Required"],["Detailed reason","textarea","Access removal approved by the user's manager and security administrator.","Required · audited"],["Approval reference","text","IAM-REQ-2841","Required for provider access"],["Notify user","toggle","Enabled","Excludes sensitive details"]]]
  ]};
  if (["ORG-03","ORG-04"].includes(id) && (action.includes("role") || action.includes("scope") || action.includes("restrict") || action.includes("team"))) return { title: action.includes("scope") || action.includes("restrict") ? "Change user access scope" : action.includes("team") ? "Link user to support team" : "Assign or change user role", sections: [
    ["User context", [["User","readonly","Jordan Lee · jordan.lee@northstar.example","Current user"],["Organization","readonly",id === "ORG-03" ? "Northstar Retail" : "Service Provider","Tenant boundary"],["Current roles","readonly",id === "ORG-03" ? "Client user" : "Support agent","Before change"],["Current scope","readonly","Northstar Retail · Commerce API","Before change"]]],
    ["Role assignment", [["Access template","select",id === "ORG-03" ? "Client administrator — standard" : "Support supervisor — scoped","Starts with approved permissions"],["Roles","multiselect",id === "ORG-03" ? "Client administrator; Reporting viewer" : "Support supervisor; Worklog approver; Report viewer","At least one · conflicts blocked"],["Support teams","multiselect","Application Support; Engineering Escalation","Provider users only"],["Permission preview","readonly","18 allowed · 4 conditional · 63 denied","Calculated from selected roles"]]],
    ["Data scope", [["Client scope","select",id === "ORG-03" ? "Own organization only" : "Selected client organizations","Required"],["Clients","multiselect","Northstar Retail; Gulf Health Group","Provider users only"],["Applications","multiselect","Commerce API; Customer Portal","Cannot exceed client scope"],["Ticket scope","select","Assigned team and explicit clients","Least privilege default"]]],
    ["Governance", [["Effective from","datetime","2026-10-20 09:00","Required"],["Access expiry","date","2027-01-20","Required for temporary access"],["Business justification","textarea","Temporary supervisory cover for the payment support queue.","Required"],["Approval route","readonly","Manager → Security administrator","Separation of duties enforced"]]]
  ]};
  if (["ORG-03","ORG-04"].includes(id) && action.includes("resend")) return { title: "Resend user invitation", sections: [
    ["Invitation", [["Invitee","readonly","Jordan Lee · jordan.lee@northstar.example","Pending identity"],["Original sent","readonly","2026-10-15 11:42","Invitation INV-2841"],["Expires","readonly","2026-10-22 11:42","Current expiry"],["Delivery status","readonly","Bounced — mailbox unavailable","Review before resend"]]],
    ["Resend settings", [["Email address","email","jordan.lee@northstar.example","Duplicate check applies"],["Invitation language","select","English","Required"],["Reset expiry window","select","7 days from resend","Required"],["Personal message","textarea","Your support portal access is ready. Please activate it before expiry.","Optional"]]]
  ]};
  if (["ORG-03","ORG-04"].includes(id)) return { title: workflowTitle("Invite new user", "Edit user identity and access"), sections: [
    ["Identity", [["Account type","select",id === "ORG-03" ? "Client user" : "Provider staff","Required"],["Full name","text","Jordan Lee","Required"],["Work email","email","jordan.lee@northstar.example","Required · unique · verified domain"],["Organization","select",id === "ORG-03" ? "Northstar Retail" : "Service Provider","Required"],["Job title","text","Finance Operations Manager","Optional"],["Manager or sponsor","select","Maya Chen","Required for privileged access"]]],
    ["Role and scope", [["Access template","select",id === "ORG-03" ? "Client user — standard" : "Support agent — standard","Recommended starting point"],["Roles","multiselect",id === "ORG-03" ? "Client user; Reporting viewer" : "Support agent; Worklog contributor","At least one · conflicts blocked"],["Support team","select","Application Support","Provider users only"],["Client scope","select",id === "ORG-03" ? "Own organization only" : "Assigned clients only","Required"],["Application access","multiselect","Commerce API; Customer Portal","Cannot exceed client scope"],["Permission preview","readonly","12 allowed · 3 conditional · 70 denied","Review effective permissions"]]],
    ["Authentication and lifecycle", [["Identity source","select","Email invitation","SSO may be required"],["Require MFA","toggle","Enabled","Mandatory for privileged roles"],["Invitation expiry","select","7 days","Required"],["Access start","datetime","2026-10-20 09:00","Required"],["Access expiry","date","No expiry","Required for temporary access"],["Account status","select","Invitation pending","Activation follows verification"]]],
    ["Review and approval", [["Business justification","textarea","New authorized contact for payment support and reporting.","Required for elevated roles"],["Approval route","readonly","Client administrator → Security administrator","Calculated from roles"],["Conflict check","readonly","No conflicting roles detected","Must pass"],["Send invitation after approval","toggle","Enabled","No credentials sent before approval"]]]
  ]};
  if (id === "CLIENT-08" && action.includes("disable")) return { title: "Disable organization user", sections: [
    ["User and access", [["User","readonly","Farah Khan · farah.khan@northstar.example","Selected organization user"],["Organization","readonly","Northstar Retail","Cannot be changed"],["Current role","readonly","Client user","Current access"],["Application scope","readonly","Commerce API; Customer Portal","Will be removed"],["Open requests","readonly","2 tickets waiting for client","Reassign follow-up contact"],["Administrator check","readonly","Maya Chen remains active administrator","Cannot disable the last client administrator"]]],
    ["Deactivation", [["Effective time","datetime","2026-10-18 17:00","Required"],["Transfer ticket follow-up to","select","Maya Chen","Required when open tickets exist"],["End active sessions","toggle","Enabled","Recommended"],["Reason","textarea","The user no longer requires access to the support portal.","Required · audit only"],["Notify user","toggle","Enabled","Sends access-change notice"]]]
  ]};
  if (id === "CLIENT-08" && action.includes("resend")) return { title: "Resend sub-user invitation", sections: [
    ["Pending invitation", [["Invitee","readonly","Farah Khan · farah.khan@northstar.example","Invitation INV-CL-119"],["Organization","readonly","Northstar Retail","Cannot be changed"],["Role","readonly","Client user","Approved role"],["Applications","readonly","Commerce API; Customer Portal","Approved scope"],["Delivery state","readonly","Expired","Current state"],["Original sent","readonly","2026-10-10 11:42","Audit history"]]],
    ["Resend options", [["Verified email","email","farah.khan@northstar.example","Must match allowed organization domain"],["Invitation language","select","English","Required"],["New expiry","select","7 days from resend","Required"],["Personal message","textarea","Your Northstar Retail support portal invitation has been renewed.","Optional"]]]
  ]};
  if (id === "CLIENT-08") return { title: workflowTitle("Invite organization user", "Edit organization user access"), sections: [
    ["User identity", [["Organization","readonly","Northstar Retail","Fixed to signed-in client account"],["Full name","text","Farah Khan","Required"],["Business email","email","farah.khan@northstar.example","Required · unique · allowed domain"],["Job title","text","Finance Operations Specialist","Optional"],["Preferred language","select","English","Required"],["Time zone","select","Asia/Bahrain","Required"]]],
    ["Client role", [["Role","select","Client user","Client administrator requires confirmation"],["Can submit tickets","toggle","Enabled","Standard permission"],["Can view organization tickets","toggle","Disabled","Administrator-controlled"],["Can view contracts and hours","toggle","Disabled","Sensitive entitlement permission"],["Can submit hour disputes","toggle","Disabled","Authorized users only"],["Effective permission preview","readonly","Submit and view own tickets · no financial access","Calculated"]]],
    ["Application and ticket scope", [["Applications","multiselect","Commerce API; Customer Portal","Cannot exceed organization applications"],["Ticket visibility","select","Tickets created by this user","Least privilege default"],["Notification groups","multiselect","Ticket updates; SLA warnings","Within enabled channels"],["Access expiry","date","No expiry","Required for temporary users"]]],
    ["Invitation and review", [["Send invitation","toggle","Enabled","No password is emailed"],["Require MFA","toggle","Enabled","Organization policy"],["Invitation expiry","select","7 days","Required"],["Business reason","textarea","Finance support contact for payment and reconciliation tickets.","Required for elevated access"],["Administrator protection","readonly","Maya Chen remains the active primary administrator","Last administrator cannot be removed"]]]
  ]};
  if (id === "IAM-01") return { title: workflowTitle("Create custom role", "Edit role draft"), sections: [
    ["Role identity", [["Role name","text","Scoped Support Supervisor","Required · unique"],["Role code","text","SUP-SCOPED","Required · immutable after publish"],["Role type","select","Provider custom role","Required"],["Based on","select","Support Supervisor","Optional approved template"],["Description","textarea","Supervises selected teams and approves worklogs within assigned clients.","Required"]]],
    ["Permissions", [["Ticket permissions","multiselect","View scoped tickets; Assign tickets; Change priority; Add private note","Least privilege"],["Worklog permissions","multiselect","View team worklogs; Approve; Return for correction","Conflicts checked"],["Reporting permissions","multiselect","View SLA report; Export scoped evidence","Exports audited"],["Administration permissions","multiselect","Manage team membership; View users","Cannot manage own role"]]],
    ["Constraints", [["Client scope mode","select","Selected clients only","Required"],["Requires MFA","toggle","Enabled","Mandatory for privileged role"],["Maximum assignment period","select","90 days","Temporary access control"],["Conflicting roles","readonly","Contract approver; Security administrator","Cannot be assigned together"]]],
    ["Publication", [["Role owner","select","Security Operations","Required"],["Change reason","textarea","Create scoped supervisor access without full administration.","Required"],["Approval route","readonly","Security administrator → Platform administrator","Two-person review"],["Version","readonly","v1 Draft","Published versions remain auditable"]]]
  ]};
  if (id === "IAM-02") return { title: "Edit role permission matrix", sections: [
    ["Matrix context", [["Role","select","Scoped Support Supervisor","Required"],["Compare with","select","Support Supervisor","Optional"],["Module filter","select","All modules","Current view"],["Permission search","text","ticket.assign","Search code or label"]]],
    ["Ticket permissions", [["View tickets","select","Allow — assigned scope","Read permission"],["Create tickets","select","Allow — assigned clients","Create permission"],["Assign tickets","select","Allow — assigned teams","Elevated permission"],["Delete tickets","select","Deny","Protected action"]]],
    ["Administrative permissions", [["View users","select","Allow — assigned teams","Read permission"],["Invite users","select","Deny","Identity administration"],["Assign roles","select","Deny","Separation of duties"],["Export audit data","select","Deny","Compliance permission"]]],
    ["Change control", [["Impact","readonly","3 changes · 18 users affected","Review impact"],["Conflict analysis","readonly","No toxic combination","Must pass"],["Change rationale","textarea","Limit assignment to supervised teams.","Required"],["Publish mode","select","Submit for approval","Direct publish not permitted"]]]
  ]};
  if (id === "IAM-03") return { title: action.includes("reject") ? "Reject access request" : action.includes("information") ? "Request access information" : action.includes("revoke") ? "Revoke reviewed access" : "Review access request", sections: [
    ["Request summary", [["Request","readonly","IAM-REQ-2841","Current request"],["Requested for","readonly","Jordan Lee · Provider staff","Verified"],["Requested by","readonly","Lina Ahmed · Support Manager","Sponsor"],["Requested access","readonly","Scoped Support Supervisor · Northstar Retail","Role and scope"],["Requested period","readonly","2026-10-20 → 2027-01-20","Temporary"],["Business reason","readonly","Temporary supervisory cover for payment support.","Recorded"]]],
    ["Risk and conflicts", [["Sensitive permissions","readonly","Assign tickets; Approve worklogs","Elevated"],["Role conflicts","readonly","No conflict detected","Automated check"],["Existing access","readonly","Support Agent · Application Support","Remains active"],["Scope comparison","readonly","Adds Gulf Health Group","New boundary"]]],
    ["Decision", [["Decision","select",action.includes("reject") ? "Reject" : action.includes("information") ? "More information required" : action.includes("revoke") ? "Revoke access" : "Approve with conditions","Required"],["Approved role","select","Scoped Support Supervisor","Cannot exceed request"],["Approved scope","multiselect","Northstar Retail; Gulf Health Group","Within reviewer authority"],["Expiry","date","2027-01-20","Required"],["Decision rationale","textarea","Approved with MFA and quarterly review.","Required · audited"],["Notify","multiselect","Requested user; Sponsor; Security administrators","Automatic"]]]
  ]};
  if (id === "IAM-04") return { title: action.includes("cancel") ? "Cancel pending invitation" : action.includes("link") ? "Link invitation to verified identity" : action.includes("bulk") ? "Bulk invite users" : "Resend user invitation", sections: [
    ["Invitation scope", [["Organization","select","Northstar Retail","Required"],["Invitation","select","INV-2841 · Jordan Lee","Required unless bulk"],["Identity source","select","Email invitation","SSO rules checked"],["Status","readonly","Pending · 4 days remaining","Current"]]],
    ["Invitees", [["Email addresses","textarea","jordan.lee@northstar.example\nfarah.khan@northstar.example","One per line · duplicate check"],["Default role","select","Client user","Required"],["Application scope","multiselect","Commerce API; Customer Portal","Optional"],["Expiry window","select","7 days","Required"]]],
    ["Validation and delivery", [["Domain check","readonly","2 of 2 match allowed domains","Must pass"],["Duplicate identity check","readonly","No active duplicates","Must pass"],["Delivery language","select","English","Required"],["Send after approval","toggle","Enabled","Privileged roles require approval"],["Internal note","textarea","Requested during client onboarding.","Audited"]]]
  ]};
  if (id === "DEPT-01") return { title: workflowTitle("Create support department", "Edit support department"), sections: [
    ["Department identity", [["Department name","text","Application Support","Required · unique"],["Department code","text","APP-SUP","Required · uppercase · immutable after activation"],["Description","textarea","Owns incidents and requests for supported business applications.","Required"],["Status","select","Draft","Required"]]],
    ["Ownership and coverage", [["Department lead","select","Lina Ahmed","Required"],["Backup lead","select","Omar Khalid","Required"],["Support teams","multiselect","Application Support; Engineering Escalation","At least one active team"],["Covered applications","multiselect","Commerce API; Customer Portal","Optional restriction"],["Business calendar","select","Bahrain Business Hours","Required"],["Default escalation department","select","Engineering and Platform","Cannot reference itself"]]],
    ["Intake and routing", [["Intake channels","multiselect","Portal; Verified email; Phone","At least one"],["Default queue","select","Application Support queue","Required"],["Unclassified ticket handling","select","Route to department triage","Required"],["Department visibility","select","Provider users and assigned client administrators","Scope controlled"]]],
    ["Change control", [["Open tickets","readonly","128 active · 9 unassigned","Impact preview"],["Issue types","readonly","14 active · 2 draft","Must be reassigned before deactivation"],["Change reason","textarea","Create a dedicated ownership area for supported business applications.","Required"],["Approval route","readonly","Service manager → Provider administrator","Required before activation"]]]
  ]};
  if (id === "ISSUE-01") return { title: workflowTitle("Create issue type", "Edit issue type draft"), sections: [
    ["Classification", [["Support department","select","Application Support","Required"],["Issue type name","text","Payment processing failure","Required · unique within department"],["Issue type code","text","APP-PAY-FAIL","Required · immutable after publish"],["Parent category","select","Incident > Payments","Required"],["Description","textarea","Payment succeeds or starts but downstream confirmation or order status is incorrect.","Required"],["Status","select","Draft","Required"]]],
    ["Ticket form behavior", [["Client-facing label","text","Payment completed but order is pending","Required"],["Required fields","multiselect","Affected service; Environment; Occurrence time; Related release","At least subject and description"],["Evidence guidance","textarea","Attach the order reference, payment timestamp, and a screenshot with sensitive values hidden.","Shown to requester"],["Allow attachments","toggle","Enabled","File policy still applies"],["Allow client selection","toggle","Enabled","Hide internal-only types"]]],
    ["Routing and service targets", [["Default team","select","Application Support","Required"],["Fallback team","select","Engineering Escalation","Required"],["Default priority","select","P2 — High","Can be recalculated by impact and urgency"],["SLA policy","select","Premium Incident SLA","Contract may override"],["Assignment rule","select","Payment incidents by supported application","Required before publish"]]],
    ["Lifecycle and governance", [["Allowed initial states","multiselect","New; Triaged","At least one"],["Resolution codes","multiselect","Configuration corrected; Code fix; Client guidance; Duplicate","At least one"],["Client visibility","select","Visible to authorized clients","Required"],["Active tickets using type","readonly","36 tickets","Cannot delete when in use"],["Change rationale","textarea","Separate payment failures for accurate routing and SLA reporting.","Required"],["Publication","select","Submit for approval","Versioned and audited"]]]
  ]};
  if (id === "APP-01") return { title: workflowTitle("Add supported application", "Edit supported application"), sections: [
    ["Application", [["Client","select","Northstar Retail","Required"],["Application name","text","Commerce API","Required"],["Application code","text","NSR-COM-API","Unique per client"],["Lifecycle status","select","Production","Required"]]],
    ["Ownership and service", [["Business owner","text","Maya Chen","Required"],["Technical contact","email","platform@northstar.example","Required"],["Support team","select","Application Support","Required"],["Service tier","select","Premium","Must be covered by contract"]]],
    ["Technical context", [["Production URL","text","https://api.northstar.example","Optional · valid URL"],["Current version","text","v4.18.2","Optional"],["Environment notes","textarea","Production and UAT environments share the same release train.","Do not enter secrets"]]]
  ]};
  if (id === "TEAM-01" && action.includes("member")) return { title: "Add support team member", sections: [
    ["Member", [["Support team","readonly","Application Support","Current team"],["Provider user","select","Nina Das","Required · active user"],["Membership role","select","Support agent","Required"],["Effective date","date","2026-10-20","Required"]]],
    ["Assignment scope", [["Applications","multiselect","Commerce API; Customer Portal","Optional restriction"],["Queue permissions","multiselect","View; Assign; Update status","Role controlled"],["Working calendar","select","Bahrain Business Hours","Required"],["Notify member","toggle","Enabled","Recommended"]]]
  ]};
  if (id === "TEAM-01") return { title: workflowTitle("Create support team", "Edit support team"), sections: [
    ["Team details", [["Team name","text","Application Support","Required · unique"],["Team lead","select","Lina Ahmed","Required"],["Queue code","text","APP-SUP","Required"],["Status","select","Active","Required"]]],
    ["Coverage", [["Members","multiselect","Omar Khalid; Nina Das; Mahmoud Nader","At least one member"],["Supported applications","multiselect","Commerce API; Customer Portal","Optional"],["Working calendar","select","Bahrain Business Hours","Required"],["Escalation team","select","Engineering Escalation","Cannot reference itself"]]]
  ]};
  if (id === "RULE-01") return { title: workflowTitle("Create routing rule", "Edit routing rule"), sections: [
    ["Rule identity", [["Rule name","text","Critical production incidents","Required · unique"],["Priority order","number","10","Lower numbers run first"],["Status","select","Draft","Publish after testing"],["Effective date","date","2026-10-20","Cannot precede today"]]],
    ["When", [["Client","select","All authorized clients","Optional"],["Application","select","Production applications","Optional"],["Category","select","Incident","Required"],["Impact","select","Business critical","Required"]]],
    ["Then", [["Assign team","select","Application Support","Required"],["Set priority","select","P1 — Critical","Required"],["Apply SLA policy","select","Premium Incident SLA","Required"],["Notify","multiselect","Team lead; Duty manager","Optional"]]],
    ["Test scenario", [["Sample ticket","select","ST-10482 — Payment confirmation fails","Required before publish"],["Expected result","readonly","Application Support · P1 · Premium Incident SLA","Must match actual result"]]]
  ]};
  if (["CONT-01","CONT-02","CONT-03","CONT-04"].includes(id)) return { title: id === "CONT-03" ? workflowTitle("Add contract coverage", "Edit contract coverage") : id === "CONT-04" ? workflowTitle("Add approved hour movement", "Correct hour movement") : workflowTitle("Create contract", "Edit contract draft"), sections: [
    ["Contract identity", [["Client","select","Northstar Retail","Required"],["Contract number","text","CON-2026-018","Required · unique"],["Version","text","v3 Draft","Immutable after activation"],["Status","select","Draft","Approval required to activate"]]],
    ["Term and ownership", [["Start date","date","2026-01-01","Required"],["End date","date","2026-12-31","After start date"],["Contract owner","select","Sarah Morgan","Required"],["Client approver","select","Maya Chen","Required"]]],
    ["Entitlement", [["Contract model","select","Purchased hours","Purchased hours or Annual unlimited"],["Support plan","select","Premium Support","Required"],["Purchased hours","number","120","Required only for purchased-hours model"],["Unlimited period","select","Annual","Does not expand scope or imply 24 × 7"],["Rollover hours","number","8","Purchased-hours policy only"],["Low-balance threshold","number","12","Purchased-hours model only"]]],
    ["Coverage", [["Applications","multiselect","Commerce API; Customer Portal","At least one"],["Services","multiselect","Incident support; Request fulfilment","Required"],["Excluded services","textarea","Major enhancement projects and on-site support.","Shown during entitlement check"],["Evidence","upload","Attach signed agreement","Required before activation"]]]
  ]};
  if (["SLA-01","SLA-02"].includes(id)) return { title: workflowTitle("Create SLA policy", "Edit SLA policy draft"), sections: [
    ["Policy", [["Policy name","text","Premium Incident SLA","Required · unique"],["Policy version","text","v2 Draft","System generated on publish"],["Applies to","select","Premium Support contracts","Required"],["Working calendar","select","Bahrain Business Hours","Required"]]],
    ["Targets", [["P1 first response","duration","15 minutes","Required"],["P1 service restoration","duration","2 hours","Required when contracted"],["P1 permanent resolution","duration","4 hours","Required"],["P2 first response","duration","30 minutes","Required"],["P2 service restoration","duration","4 hours","Required when contracted"],["P2 permanent resolution","duration","8 hours","Required"]]],
    ["Clock behavior", [["Pause on status","multiselect","Waiting for Client; Approved Hold","Policy approval required"],["Resume event","select","Client reply or manual resume","Required"],["Warning threshold","number","80%","Between 1 and 99"],["Breach escalation","select","Supervisor then duty manager","Required"]]],
    ["Simulation", [["Sample submitted time","datetime","2026-10-18 15:30","Required for test"],["Calculated response due","readonly","2026-10-18 16:00","Uses selected calendar"],["Calculated restoration due","readonly","2026-10-18 19:30","Tracked separately"],["Calculated resolution due","readonly","2026-10-19 11:30","Excludes non-working time"]]]
  ]};
  if (id === "SLA-03" && action.includes("holiday")) return { title: "Add holiday", sections: [
    ["Holiday", [["Business calendar","readonly","Bahrain Business Hours","Current calendar"],["Holiday name","text","National Day","Required"],["Start date","date","2026-12-16","Required"],["End date","date","2026-12-17","On or after start date"]]],
    ["Behavior", [["Working time treatment","select","Non-working day","Required"],["Recurrence","toggle","Annual","Review yearly"],["Description","textarea","Bahrain National Day holiday period.","Optional"],["Affected SLA preview","readonly","14 active targets will recalculate","Review before save"]]]
  ]};
  if (id === "SLA-03") return { title: workflowTitle("Create business calendar", "Edit business calendar"), sections: [
    ["Calendar", [["Calendar name","text","Bahrain Business Hours","Required · unique"],["Time zone","select","Asia/Bahrain","Required"],["Working days","multiselect","Sunday; Monday; Tuesday; Wednesday; Thursday","At least one"],["Status","select","Active","Required"]]],
    ["Working hours", [["Day start","time","08:00","Required"],["Day end","time","17:00","After start"],["Break start","time","12:30","Optional"],["Break end","time","13:30","Optional"]]],
    ["Holidays", [["Holiday source","select","Managed manually","Required"],["Holiday date","date","2026-12-16","No duplicates"],["Holiday name","text","National Day","Required"],["Recurrence","toggle","Annual","Review each year"]]]
  ]};
  if (["WL-01","WL-03"].includes(id)) return { title: workflowTitle("Add worklog", "Edit worklog"), sections: [
    ["Work performed", [["Ticket","select","ST-10482 — Payment confirmation fails","Required"],["Work date","date","2026-10-18","Required · open period"],["Start time","time","10:15","Required"],["Duration","duration","1 hour 30 minutes","Required · no overlap"]]],
    ["Classification", [["Activity type","select","Investigation and resolution","Required"],["Billable","toggle","Yes","Based on contract coverage"],["Performed by","readonly","Mahmoud Nader","Current user"],["Approval route","readonly","Application Support supervisor","Calculated"]]],
    ["Description", [["Work summary","textarea","Reviewed payment callbacks, identified an invalid signing key reference, and validated the corrected configuration in UAT.","Required · minimum 20 characters"],["Internal evidence","upload","Attach diagnostic evidence","Optional · internal visibility"]]]
  ]};
  if (id === "CLIENT-06") return { title: "Submit support-hour dispute", sections: [
    ["Disputed entry", [["Statement period","select","October 2026","Required"],["Worklog reference","select","WL-8492 · 3.5 h · ST-10468","Required"],["Disputed hours","number","2.0","Cannot exceed approved entry"],["Dispute reason","select","Time not related to request","Required"]]],
    ["Explanation and evidence", [["Explanation","textarea","The final two hours relate to a separate enhancement that was not approved under this support request.","Required"],["Client evidence","upload","Attach emails or meeting notes","Optional"],["Client contact","readonly","Maya Chen","Submitting user"]]]
  ]};
  if (id === "SET-01") return { title: "Edit ticket taxonomy and lifecycle draft", sections: [
    ["Taxonomy item", [["Item type","select","Category","Required"],["Parent category","select","Incident","Optional for root item"],["Name","text","Payment processing","Required · unique among siblings"],["Code","text","INC-PAY","Required · immutable after publish"]]],
    ["Lifecycle mapping", [["Initial status","select","New","Required"],["Allowed next statuses","multiselect","Triaged; In Progress; Rejected","At least one"],["Closure status","select","Resolved","Required"],["Reopen window","duration","5 business days","Policy controlled"]]],
    ["Visibility and publication", [["Client visible","toggle","Yes","Internal-only items remain hidden"],["Required fields","multiselect","Impact; Application; Description","Applied on submit"],["Draft version","readonly","v5 Draft","Compared with v4 Published"],["Change rationale","textarea","Add payment-specific routing and required evidence.","Required before approval"]]]
  ]};
  if (id === "SET-02") return { title: workflowTitle("Create response template", "Edit response template"), sections: [
    ["Template", [["Template name","text","Request diagnostic logs","Required · unique"],["Category","select","Incident response","Required"],["Audience","select","Client visible","Required"],["Language","select","English","Required"]]],
    ["Content", [["Subject suggestion","text","Additional diagnostic information required","Optional"],["Response body","textarea","Hello {{requester_name}},\n\nPlease attach the application logs for {{ticket_reference}} covering the reported time window. Remove passwords, tokens, and personal data before upload.\n\nThank you,\n{{agent_name}}","Required · approved placeholders only"],["Available variables","readonly","requester_name; ticket_reference; agent_name; client_name","No arbitrary code"]]],
    ["Governance", [["Owner","select","Application Support","Required"],["Approval state","select","Draft","Only approved templates can be inserted"],["Effective date","date","2026-10-20","Optional"],["Change note","textarea","Updated security guidance for uploaded logs.","Required on edit"]]]
  ]};
  if (id === "INT-01") return { title: workflowTitle("Add integration", "Edit integration"), sections: [
    ["Integration", [["Integration name","text","Support mailbox intake","Required · unique"],["Channel type","select","Verified email","Required"],["Environment","select","Production","Required"],["Status","select","Enabled","Requires successful test"]]],
    ["Connection", [["Endpoint or mailbox","text","support@service.example","Required"],["Authentication method","select","OAuth 2.0","Required"],["Secret reference","password","••••••••••••","Stored in secure vault"],["Timeout","number","30 seconds","Between 5 and 120"]]],
    ["Processing", [["Default client matching","select","Verified sender domain","Required"],["Unmatched message action","select","Quarantine for review","Required"],["Create ticket status","select","New","Required"],["Retry policy","select","3 attempts with backoff","Required"]]],
    ["Validation", [["Test connection","action","Last test successful at 14:08","Required before enable"],["Last correlation ID","readonly","INT-TEST-77381","Audit reference"]]]
  ]};
  if (id === "RET-01") return { title: workflowTitle("Create controlled deletion request", "Edit controlled deletion request"), sections: [
    ["Request scope", [["Record type","select","Client organization","Required"],["Record reference","text","ORG-0042 · Northstar Retail","Required"],["Requested action","select","Delete after retention check","Required"],["Reason","select","Contractual deletion request","Required"]]],
    ["Assessment", [["Open tickets","readonly","2 open tickets","Must be resolved or exempted"],["Financial records","readonly","Retain until 2031-12-31","Cannot be deleted"],["Legal hold","readonly","No active hold","Checked automatically"],["Eligible date","readonly","2032-01-01","Calculated"]]],
    ["Approval evidence", [["Request evidence","upload","Attach approved client request","Required"],["Risk assessment","textarea","Delete user-generated content after retaining mandatory billing and audit records.","Required"],["Primary approver","select","Compliance Officer","Required"],["Execution mode","select","Scheduled after eligibility date","Required"]]]
  ]};
  if (id === "PROFILE-01") return { title: "Edit profile and preferences", sections: [
    ["Identity", [["Full name","readonly","Mahmoud Nader","Managed by identity provider"],["Work email","readonly","mahmoud.nader@service.example","Managed by identity provider"],["Organization","readonly","Service Provider","Read only"],["Roles","readonly","Support supervisor; Provider administrator","Administrator managed"]]],
    ["Display preferences", [["Language","select","English","Required"],["Time zone","select","Asia/Bahrain","Required"],["Date format","select","DD MMM YYYY","Required"],["Compact tables","toggle","Enabled","Personal preference"]]],
    ["Notifications", [["Ticket assignment","toggle","Enabled","Mandatory in-app notification"],["SLA warnings","toggle","Enabled","Cannot disable for supervisors"],["Approval requests","toggle","Enabled","Email and in-app"],["Weekly summary","toggle","Disabled","Optional"]]]
  ]};
  const fallbackFields = split(screen.key_data).slice(0, 6).map((x, i) => [x, i === 0 ? "text" : "select", i === 0 ? `Enter ${x.toLowerCase()}` : "Select option", i < 3 ? "Required" : "Optional"]);
  return { title: state.formAction || `${state.formMode === "edit" ? "Edit" : "Add"} ${screen.module.toLowerCase()} record`, sections: [
    ["Action context", [["Requested action","readonly",state.formAction || (state.formMode === "edit" ? "Edit record" : "Create record"),"Selected from this screen"],["Reference","text",screen.screen_id + "-DRAFT","Required"],["Effective date and time","datetime","2026-10-20 09:00","Required"],["Owner","select",screen.primary_roles.split(";")[0],"Must have permission"]]],
    ["Record details", fallbackFields.length ? fallbackFields : [["Name","text","Enter a clear name","Required"],["Status","select","Draft","Required"],["Description","textarea","Describe the requested change and expected outcome.","Required"]]],
    ["Governance and evidence", [["Business reason","textarea",screen.business_objective,"Required for a material change"],["Supporting evidence","upload","Attach supporting evidence","Optional unless policy requires it"],["Visibility","readonly",screen.permissions_and_visibility,"Enforced automatically"],["Validation summary","readonly",screen.validation_and_business_rules,"Must pass before completion"]]]
  ] };
}

async function loadData() {
  const [screenText, navText] = await Promise.all([
    fetch("./support_ticketing_screen_catalog_en.csv", { cache: "no-store" }).then(r => {
      if (!r.ok) throw new Error(`Screen catalog could not load (${r.status})`);
      return r.text();
    }),
    fetch("./support_ticketing_navigation_matrix_en.csv", { cache: "no-store" }).then(r => {
      if (!r.ok) throw new Error(`Navigation matrix could not load (${r.status})`);
      return r.text();
    })
  ]);
  state.screens = parseCSV(screenText);
  state.nav = parseCSV(navText);
  render();
  document.querySelector("#loading").hidden = true;
  document.querySelector("#app").hidden = false;
}

function navGroups(panel) {
  const rows = state.nav.filter(r => r.panel_id === panel && r.menu_level !== "0");
  const pick = ids => ids.map(id => rows.find(r => r.nav_id === id)).filter(Boolean);
  const relabel = (ids, labels) => pick(ids).map((row,index) => ({...row, label: labels[index] || row.label}));
  if (panel === "CLIENT") return [
    { name: "Home", rows: relabel(["CL-01"],["Dashboard"]) },
    { name: "Tickets", rows: relabel(["CL-02","CL-04"],["My tickets","New ticket"]) },
    { name: "Contracts", rows: relabel(["CL-05","CL-06","CL-07"],["Coverage and hours","Hour statement","Hour disputes"]) },
    { name: "Account", rows: relabel(["CL-10","CL-08","CL-09"],["Organization users","Notifications","Profile"]) }
  ];
  if (panel === "SUPPORT") return [
    { name: "My work", rows: relabel(["AG-01","AG-03","AG-04","AG-08","AG-09"],["My tickets","Waiting on customer","SLA risks","My worklogs","Notifications"]) },
    { name: "Operations", rows: relabel(["SUP-01","AG-07","SUP-06"],["Operations dashboard","New customer ticket","Teams"]) },
    { name: "Approvals", rows: relabel(["SUP-07","SUP-08","SUP-09","SUP-10"],["Approval center","Worklog approvals","Contract exceptions","Channel intake"]) },
    { name: "Reports", rows: relabel(["SUP-11","SUP-12","SUP-13","SUP-14"],["Reports home","SLA report","Hours report","Service analytics"]) }
  ];
  return [
    { name: "Home", rows: relabel(["ADM-01"],["Admin dashboard"]) },
    { name: "Customers", rows: relabel(["ADM-03","ADM-04","ADM-05"],["Organizations","Customer users","Applications"]) },
    { name: "Access", rows: relabel(["IAM-06","IAM-02","IAM-03","IAM-04","IAM-05"],["Users","Roles","Permissions","Access reviews","Invitations"]) },
    { name: "Support setup", rows: relabel(["SUPADM-02","ADM-11","SUPADM-03"],["Departments","Teams","Issue types"]) },
    { name: "Contracts", rows: relabel(["ADM-07","ADM-08","ADM-09"],["Contracts","Hour ledger","Renewals"]) },
    { name: "Service rules", rows: relabel(["ADM-10","ADM-12","ADM-13","ADM-14","ADM-15","ADM-16"],["System settings","Routing","SLA policies","Calendars","Taxonomy","Templates"]) },
    { name: "Channels", rows: relabel(["ADM-17"],["Integrations"]) },
    { name: "Operations", rows: relabel(["OPS-01","OPS-04","OPS-02","OPS-03"],["Operations overview","System health","Audit log","Data retention"]) }
  ];
}

function sidebar() {
  const groups = navGroups(state.panel);
  return `<aside class="sidebar ${state.sidebarOpen ? "open" : ""}">
    <div class="brand"><div class="brand-mark">${icon("ticket", 27)}</div><div><h1>Support System</h1><small>Resolve faster. Support smarter.</small></div></div>
    <div class="panel-picker"><label>Prototype tools</label><small class="prototype-note">Demo only · hidden in production</small><div class="panel-buttons">
      ${["CLIENT","SUPPORT","ADMIN"].map(p => `<button class="panel-button ${state.panel === p ? "active" : ""}" data-panel="${p}">${p[0] + p.slice(1).toLowerCase()}</button>`).join("")}
    </div></div>
    <button class="directory-button ${state.directory?'active':''}" data-directory="1">${icon('report',18)}<span>Screen directory</span><b>${state.screens.length}</b></button>
    <nav>${groups.map(g => { const groupOpen = state.panelNavGroup[state.panel] === g.name; return `<button class="nav-section-toggle ${groupOpen?'open':''}" data-nav-group="${esc(g.name)}"><span>${esc(g.name)}</span><b>${g.rows.length}</b>${icon('arrow',15)}</button><div class="nav-section-items ${groupOpen?'open':''}">${g.rows.map(r => `<button class="nav-item ${!state.directory && state.screenId === r.target_screen_id ? "active" : ""}" data-screen="${esc(r.target_screen_id)}" data-panel-group="${esc(g.name)}">${icon(iconFor(r.label), 18)}<span>${esc(r.label)}</span></button>`).join("")}</div>`; }).join("")}</nav>
    <div class="sidebar-foot"><button class="nav-item" data-screen="PROFILE-01">${icon("user",18)}<span>Account settings</span></button><button class="nav-item" data-screen="AUTH-01">${icon("logout",18)}<span>Sign out</span></button></div>
    <p class="sidebar-copyright">&copy; 2026 Support System<br><span>All rights reserved.</span></p>
  </aside>`;
}

function authView(screen) {
  if (screen.screen_id === "AUTH-02") return `<main class="auth-shell">
    <section class="auth-card sketch-card auth-state-card">
      <div class="auth-brand"><span class="brand-mark">${icon('shield',28)}</span><div><h1>Support System</h1><small>Resolve faster. Support smarter.</small></div></div>
      <div class="auth-state-icon">${icon('warning',38)}</div><span class="eyebrow">AUTH-02 · Safe recovery</span><h2>Access unavailable</h2><p>Sign in again or return safely.</p>
      <div class="safe-reference"><span>Reference</span><strong>ACC-7H4K2</strong><small>No client or record information is disclosed.</small></div>
      <div class="auth-actions"><button class="btn-primary" data-screen="AUTH-01">${icon('logout',17)} Sign in again</button><button class="btn-secondary" data-login-panel="${state.panel}">${icon('dashboard',17)} Return to workspace</button></div>
      <button class="text-action" data-toast="Support request channel opened">Contact support</button>
    </section>
  </main>`;
  return `<main class="auth-shell">
    <section class="auth-card sketch-card">
      <div class="auth-brand"><span class="brand-mark">${icon('ticket',28)}</span><div><h1>Support System</h1><small>Resolve faster. Support smarter.</small></div></div>
      <span class="eyebrow">AUTH-01 · Secure sign in</span><h2>Welcome back</h2><p>Sign in with your work identity.</p>
      <button class="btn-primary auth-sso" data-login-panel="CLIENT">${icon('shield',18)} Continue with SSO</button>
      <div class="auth-divider"><span>or use your work email</span></div>
      <label class="auth-field"><span>Work email</span><wired-input type="email" placeholder="name@company.com"></wired-input><small>Use the email linked to your organization.</small></label>
      <button class="btn-secondary auth-email" data-login-panel="CLIENT">${icon('arrow',17)} Continue</button>
      <div class="auth-message">${icon('shield',18)} <span>No client data appears before your identity and organization are verified.</span></div>
      <div class="demo-access"><span>Prototype workspace preview</span><div><button data-login-panel="CLIENT">Client</button><button data-login-panel="SUPPORT">Support</button><button data-login-panel="ADMIN">Admin</button></div></div>
      <div class="auth-links"><button class="text-action" data-toast="Language selector opened">English</button><button class="text-action" data-toast="Help request opened">Need help?</button><button class="text-action" data-screen="AUTH-02">View access state</button></div>
    </section>
  </main>`;
}

function sampleKPIs(screen) {
  const key = screen.screen_id;
  if (key === "CLIENT-01") return [["Open tickets","7","2 need your reply"],["SLA on track","94%","Across active tickets"],["Support hours","31.5 h","8.5 h used this month"],["New notifications","4","Last update 8 min ago"]];
  if (key === "PROV-01") return [["Open tickets","128","+12 this week"],["Unassigned","9","Needs triage"],["SLA at risk","14","Next breach in 42 min"],["Pending approvals","23","11 older than one day"]];
  if (key === "ADMIN-01") return [["Active clients","42","3 onboarding"],["Provider users","68","5 roles to review"],["Contracts expiring","6","Within 30 days"],["System alerts","3","1 high priority"]];
  if (key === "OPS-00") return [["Services healthy","12/14","2 degraded"],["Backup age","3 h","Within target"],["Failed jobs","4","Last 24 hours"],["Open incidents","2","1 high priority"]];
  return [];
}

function sampleRows(screen) {
  const module = screen.module.toLowerCase();
  if (["CLIENT-01","CLIENT-02"].includes(screen.screen_id)) return [
    ["ST-10482","Payment confirmation fails","Commerce API","In Progress","Next update 14:30"],
    ["ST-10479","Users cannot export report","Customer Portal","Waiting for you","Reply requested"],
    ["ST-10474","Incorrect support-hour balance","Premium Support","SLA At Risk","38 min"],
    ["ST-10468","Add finance approver role","Organization access","New","Received today"]
  ];
  if (["ORG-03","ORG-04"].includes(screen.screen_id)) return [["USR-2048","Jordan Lee","Support agent","Scoped · 2 clients","Active"],["USR-2041","Nina Das","Support supervisor","Application Support","Active"],["INV-2841","Farah Khan","Client user","Northstar Retail","Invited"],["USR-1982","Omar Khalid","Worklog approver","2 teams","Review due"]];
  if (screen.screen_id === "CLIENT-08") return [["USR-CL-091","Maya Chen","Client administrator","All organization applications","Active"],["USR-CL-104","Jordan Lee","Client user","Commerce API","Active"],["INV-CL-119","Farah Khan","Client user","Commerce API; Customer Portal","Invitation expired"]];
  if (screen.screen_id === "IAM-01") return [["ROLE-014","Scoped Support Supervisor","Provider custom","18 users","Published"],["ROLE-009","Client Administrator","System","42 users","Published"],["ROLE-021","Audit Export Reviewer","Provider custom","3 users","Draft"]];
  if (screen.screen_id === "IAM-02") return [["ticket.view","View scoped tickets","Allow","Assigned scope","Inherited"],["ticket.assign","Assign tickets","Allow","Assigned teams","Direct"],["identity.invite","Invite users","Deny","All","Protected"],["audit.export","Export audit evidence","Deny","All","Protected"]];
  if (screen.screen_id === "IAM-03") return [["IAM-REQ-2841","Jordan Lee","Scoped Supervisor","High","Pending review"],["IAM-REQ-2836","Farah Khan","Client Administrator","High","Needs information"],["IAM-REV-0412","Omar Khalid","Worklog Approver","Medium","Review due"]];
  if (screen.screen_id === "IAM-04") return [["INV-2841","Farah Khan","northstar.example","4 days","Pending"],["INV-2838","Yousef Ali","gulfhealth.example","Expired","Delivery failed"],["INV-2833","Nora Sami","atlaslogistics.example","Accepted","Linked"]];
  if (screen.screen_id === "DEPT-01") return [["DEP-APP","Application Support","2 teams","14 issue types","Active"],["DEP-INFRA","Infrastructure and Platform","2 teams","9 issue types","Active"],["DEP-SEC","Security Operations","1 team","6 issue types","Review due"]];
  if (screen.screen_id === "ISSUE-01") return [["APP-PAY-FAIL","Payment processing failure","Application Support","P2 · Premium SLA","Published"],["APP-LOGIN","Sign-in or access issue","Application Support","P2 · Standard SLA","Published"],["INF-NET","Network connectivity interruption","Infrastructure","P1 · Critical SLA","Draft"]];
  if (module.includes("ticket") || screen.screen_id.startsWith("PROV") || screen.screen_id.startsWith("CLIENT")) return [
    ["ST-10482","Payment confirmation fails","Northstar Retail","In Progress","2h 18m"],
    ["ST-10479","Users cannot export report","Gulf Health Group","Waiting for Client","5h 04m"],
    ["ST-10474","Incorrect support-hour balance","Atlas Logistics","SLA At Risk","38m"],
    ["ST-10468","Add finance approver role","Brightline Labs","New","7h 12m"]
  ];
  if (module.includes("contract") || module.includes("entitlement")) return [
    ["CON-2026-018","Northstar Retail","Premium Support","Active","84 h"],
    ["CON-2026-011","Gulf Health Group","Enterprise Care","Expiring","26 h"],
    ["CON-2025-044","Atlas Logistics","Standard Support","Low balance","4.5 h"]
  ];
  return [
    ["ITEM-204","Northstar Retail","Needs review","Sarah M.","Today"],
    ["ITEM-198","Atlas Logistics","In progress","Omar K.","Yesterday"],
    ["ITEM-193","Gulf Health Group","Approved","Lina A.","Oct 16"]
  ];
}

function tableFor(screen) {
  const ticketLike = ticketListScreens.has(screen.screen_id) || screen.module.toLowerCase() === "tickets";
  const contractLike = screen.module.toLowerCase().includes("contract") || screen.module.toLowerCase().includes("entitlement");
  const accessHeaders = ({"ORG-03":["Reference","User","Role","Scope","Status"],"ORG-04":["Reference","User","Role","Scope","Status"],"CLIENT-08":["Reference","User","Role","Application scope","Status"],"IAM-01":["Reference","Role","Type","Assignments","Status"],"IAM-02":["Permission","Capability","Decision","Scope","Source"],"IAM-03":["Reference","User","Requested access","Risk","Status"],"IAM-04":["Reference","Invitee","Domain","Expiry","Status"],"DEPT-01":["Code","Department","Teams","Issue types","Status"],"ISSUE-01":["Code","Issue type","Department","Default service target","Status"]})[screen.screen_id];
  const clientHeaders = ["CLIENT-01","CLIENT-02"].includes(screen.screen_id) ? ["Reference","Subject","Application / service","Status","Next step"] : null;
  const headers = accessHeaders || clientHeaders || (ticketLike ? ["Reference","Subject","Client","Status","SLA"] : contractLike ? ["Reference","Client","Plan","Status","Balance"] : ["Reference","Client","Status","Owner","Updated"]);
  const rowAction = ticketListScreens.has(screen.screen_id)
    ? `data-screen="${screen.screen_id.startsWith("CLIENT") ? "CLIENT-04" : "PROV-04"}"`
    : formCapableScreens.has(screen.screen_id) ? 'data-action="open-form" data-mode="edit"' : `data-toast="Opened record"`;
  return `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${sampleRows(screen).map((r,i) => `<tr ${rowAction} aria-label="Open ${esc(r[0])}">${r.map((v,j) => `<td>${j===3 ? `<span class="status ${i===2?'dark':''}">${esc(v)}</span>` : esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function ticketDetailContent(screen) {
  const clientView = screen.screen_id === "CLIENT-04";
  if (clientView) return `<section class="client-ticket-view">
    <article class="panel sketch-card client-ticket-header">
      <div class="panel-header"><div><span class="eyebrow">Ticket ST-10482</span><h3>${icon('ticket',23)} Payment confirmation fails</h3></div><span class="status dark">Support is investigating</span></div>
      <div class="client-status-strip"><div><label>Application</label><strong>Commerce API</strong></div><div><label>Submitted</label><strong>18 Oct 2026 · 09:42</strong></div><div><label>Last update</label><strong>14 min ago</strong></div><div><label>Coverage</label><strong>Covered</strong></div></div>
      <div class="client-next-update">${icon('bell',19)} <span>Next update promised by <strong>14:30</strong>.</span></div>
    </article>
    <section class="client-ticket-main">
      <article class="panel sketch-card client-conversation">
        <div class="panel-header"><h3>${icon('people',22)} Conversation</h3><span class="status">2 public updates</span></div>
        <div class="timeline-item"><strong>Maya Chen · You</strong><small>09:42</small><p>Payment reference PAY-88431 completed, but order ORD-55102 remains pending.</p><button class="attachment-row compact" data-toast="Attachment preview opened">payment-pending.png · 428 KB</button></div>
        <div class="timeline-item"><strong>Application Support</strong><small>10:00</small><p>We reproduced the issue and are reviewing the confirmation callback after the latest release. We will update you by 14:30.</p></div>
        <div class="client-reply-box"><h4>Add a reply</h4><wired-textarea rows="3" placeholder="Share an update or answer the support team"></wired-textarea><div><button class="btn-secondary" data-toast="Attachment selected">${icon('plus',16)} Attach file</button><button class="btn-primary" data-action="open-form" data-mode="create" data-form-action="Add reply">${icon('arrow',16)} Review reply</button></div></div>
      </article>
      <aside class="grid client-ticket-side">
        <article class="panel sketch-card"><h3>${icon('report',21)} Your request</h3><p>Payment completes successfully, but the order remains pending and the confirmation callback is not recorded.</p><div class="safe-ticket-classification"><label>Category</label><span>Incident · Payments · Callback not received</span></div></article>
        <article class="panel sketch-card"><h3>${icon('clock',21)} Service progress</h3><div class="meta-grid"><div class="meta-item"><label>First response</label>Met · 18 min</div><div class="meta-item"><label>Resolution target</label>3 h 12 m remaining</div></div><small>Service targets do not represent consumed support hours.</small></article>
        <article class="panel sketch-card"><h3>${icon('people',21)} Support contact</h3><p>Application Support</p><button class="flow-link" data-toast="Support contact details opened">View contact details</button></article>
        <article class="panel sketch-card"><h3>${icon('report',21)} Self-service and feedback</h3><p>Review a related answer or rate the completed support experience.</p><button class="flow-link" data-flow="knowledge-self-service">Search knowledge</button><button class="flow-link" data-flow="satisfaction-survey">Rate resolved support</button></article>
      </aside>
    </section>
  </section>`;
  return `<section class="agent-ticket-view">
    <article class="panel sketch-card agent-ticket-header">
      <div class="panel-header"><div><span class="eyebrow">ST-10482 · Northstar Retail</span><h3>${icon('ticket',23)} Payment confirmation fails</h3></div><span class="status dark">In Progress</span></div>
      <div class="agent-ticket-facts"><div><label>Priority</label><strong>P2 — High</strong></div><div><label>Owner</label><strong>Mahmoud Nader</strong></div><div><label>Team</label><strong>Application Support</strong></div><div><label>Resolution SLA</label><strong>3 h 12 m</strong></div><div><label>Contract</label><strong>CON-2026-018</strong></div><div><label>Source</label><strong>Client portal</strong></div></div>
    </article>
    <section class="agent-workspace-grid">
      <div class="grid agent-main-column">
        <article class="panel sketch-card"><div class="panel-header"><h3>${icon('report',22)} Incident and classification</h3><button class="flow-link" data-action="open-form" data-mode="edit" data-form-action="Agent edit classification">Edit classification</button></div><p>Payment completes successfully, but the order remains pending and the confirmation callback is not recorded. Started after release 4.18.2.</p><div class="classification-path" aria-label="Issue classification path"><span>Incident</span><b>›</b><span>Payments</span><b>›</b><span>Processing failure</span><b>›</b><span>Callback not received</span></div><div class="impact-row"><span>Production</span><span>Multiple users blocked</span><span>No workaround</span></div></article>
        <article class="panel sketch-card"><div class="panel-header"><h3>${icon('people',22)} Public conversation</h3><span class="status">Client visible</span></div><div class="timeline-item"><strong>Maya Chen · Client</strong><small>09:42</small><p>Payment reference PAY-88431 completed, but order ORD-55102 remains pending.</p></div><div class="timeline-item"><strong>Mahmoud Nader · Support</strong><small>10:00</small><p>We reproduced the issue and are reviewing the confirmation callback after the latest release.</p></div><button class="btn-primary" data-toast="Public reply composer opened">${icon('arrow',16)} Reply to client</button></article>
        <article class="panel sketch-card internal-workspace"><div class="panel-header"><h3>${icon('shield',22)} Internal activity</h3><span class="status dark">Provider only</span></div><div class="timeline-item internal"><strong>Internal note · Mahmoud Nader</strong><small>10:18</small><p>Callback signing-key reference differs between production and UAT. Engineering review requested.</p></div><div class="inline-actions"><button class="btn-secondary" data-toast="Private note composer opened">Add private note</button><button class="btn-secondary" data-action="open-form" data-mode="create" data-form-action="Add worklog">Add worklog</button></div></article>
      </div>
      <aside class="grid agent-ticket-side">
        <article class="panel sketch-card"><h3>${icon('clock',21)} SLA controls</h3><div class="meta-grid"><div class="meta-item"><label>First response</label>Met · 18 min</div><div class="meta-item"><label>Service restoration</label>1 h 42 m left</div><div class="meta-item"><label>Permanent resolution</label>3 h 12 m left</div><div class="meta-item"><label>Pause state</label>Running</div></div><button class="flow-link" data-flow="sla-multi-clock">Open multi-target timeline</button></article>
        <article class="panel sketch-card"><h3>${icon('people',21)} Routing and ownership</h3><ul class="list"><li>${icon('people',17)}<span>Mahmoud Nader · Primary owner</span></li><li>${icon('settings',17)}<span>Application Support · Payment queue</span></li><li>${icon('arrow',17)}<span>Engineering Escalation · fallback</span></li></ul></article>
        <article class="panel sketch-card"><h3>${icon('contract',21)} Entitlement</h3><p>Premium Support · Covered</p><div class="meta-grid"><div class="meta-item"><label>Available hours</label>31.5 h</div><div class="meta-item"><label>Pending worklogs</label>2 h</div></div></article>
        <article class="panel sketch-card"><h3>${icon('report',21)} Related work</h3><button class="flow-link" data-toast="Audit trail opened">Open audit trail</button><button class="flow-link" data-toast="Linked incidents opened">View linked incidents</button></article>
      </aside>
    </section>
  </section>`;
}

function notificationCenterContent() {
  const clientView = state.panel === "CLIENT";
  const items = clientView ? [
    ["Ticket update", "ST-10482 · Support replied to your ticket", "We reproduced the payment confirmation issue and are reviewing the latest release.", "14 min ago", "CLIENT-04", "Unread"],
    ["SLA warning", "ST-10474 · Resolution target is approaching", "The support team has been notified. No action is required from you now.", "42 min ago", "CLIENT-04", "Unread"],
    ["Support hours", "October hour statement is available", "Your approved support-hour statement has been updated.", "Yesterday", "CLIENT-05", "Read"]
  ] : [
    ["Assignment", "ST-10482 · Ticket assigned to you", "Northstar Retail · Payment confirmation fails · P2 High", "8 min ago", "PROV-04", "Unread"],
    ["SLA breach risk", "ST-10474 · 38 minutes remaining", "Incorrect support-hour balance requires immediate follow-up.", "21 min ago", "SLA-04", "Unread"],
    ["Approval", "WL-8492 · Worklog awaiting review", "Omar Khalid submitted 3 hours 30 minutes for approval.", "Yesterday", "WL-02", "Read"]
  ];
  return `<section class="notification-layout">
    <article class="panel sketch-card notification-list-panel">
      <div class="panel-header"><h3>${icon('bell',22)} Notifications</h3><span class="status">${items.filter(item => item[5] === 'Unread').length} unread</span></div>
      <div class="notification-filters"><wired-select aria-label="Notification status"><wired-item value="all" selected>All</wired-item><wired-item value="unread">Unread</wired-item></wired-select><wired-select aria-label="Notification type"><wired-item value="all" selected>All types</wired-item><wired-item value="ticket">Tickets</wired-item><wired-item value="sla">SLA</wired-item></wired-select></div>
      <div class="notification-items">${items.map((item,index) => `<article class="notification-item ${item[5] === 'Unread' ? 'unread' : ''}">
        <div class="notification-icon">${icon(item[0].includes('SLA') ? 'clock' : item[0].includes('Approval') ? 'check' : 'ticket',21)}</div>
        <div class="notification-copy"><div class="notification-meta"><span>${esc(item[0])}</span><small>${esc(item[3])}</small></div><h4>${esc(item[1])}</h4><p>${esc(item[2])}</p><div class="notification-actions"><button class="flow-link" data-screen="${item[4]}">${icon('arrow',16)} Open record</button>${item[5] === 'Unread' ? `<button class="text-action" data-toast="Notification marked as read">Mark as read</button>` : ''}</div></div>
      </article>`).join('')}</div>
    </article>
    <aside class="panel sketch-card notification-help"><h3>${icon('settings',21)} Notification rules</h3><ul class="list"><li>${icon('check',17)}<span>Opening a notification rechecks record access.</span></li><li>${icon('lock',17)}<span>Restricted record titles are never exposed.</span></li><li>${icon('bell',17)}<span>Mandatory operational alerts cannot be disabled.</span></li></ul><button class="flow-link" data-flow="notification-delivery">Open delivery log</button></aside>
  </section>`;
}

function clientContractsContent(screen) {
  if (screen.screen_id === "CLIENT-07") return `<section class="client-hours-layout">
    <article class="panel sketch-card contract-overview-card">
      <div class="panel-header"><h3>${icon('contract',23)} CON-2026-018 · Premium Support</h3><span class="status dark">Active</span></div>
      <div class="contract-period"><span>01 Jan 2026</span><span>Valid through 31 Dec 2026</span><span>Last refreshed 18 Oct 2026 · 11:20</span></div>
      <div class="hours-summary"><div><label>Purchased</label><strong>40 h</strong></div><div><label>Approved usage</label><strong>8.5 h</strong></div><div><label>Available</label><strong>31.5 h</strong></div><div><label>Pending review</label><strong>2 h</strong></div></div>
      <div class="coverage-summary"><div><h4>Covered applications</h4><p>Commerce API · Customer Portal</p></div><div><h4>Covered services</h4><p>Incident support · Request fulfilment</p></div></div>
      <div class="inline-actions"><button class="btn-primary" data-screen="CLIENT-05">${icon('report',17)} Open hour statement</button><button class="btn-secondary" data-screen="CLIENT-06">${icon('warning',17)} View disputes</button><button class="btn-secondary" data-screen="CLIENT-03">${icon('plus',17)} Create ticket</button></div>
    </article>
    <aside class="panel sketch-card"><h3>${icon('warning',21)} Balance guidance</h3><p>Your available balance is above the warning threshold.</p><ul class="list"><li>${icon('check',17)}<span>Only approved worklogs reduce the balance.</span></li><li>${icon('clock',17)}<span>Pending hours are shown separately.</span></li><li>${icon('shield',17)}<span>SLA time is never deducted as support hours.</span></li></ul></aside>
  </section>`;
  if (screen.screen_id === "CLIENT-05") return `<section class="hour-statement-layout">
    <section class="hours-summary statement-summary"><div><label>Opening balance</label><strong>40 h</strong></div><div><label>Added</label><strong>0 h</strong></div><div><label>Approved deductions</label><strong>8.5 h</strong></div><div><label>Closing balance</label><strong>31.5 h</strong></div></section>
    <article class="panel sketch-card">
      <div class="panel-header"><h3>${icon('report',22)} October 2026 statement</h3><span class="status">Approved movements only</span></div>
      <div class="statement-filters"><wired-select aria-label="Contract"><wired-item value="con" selected>CON-2026-018</wired-item></wired-select><wired-select aria-label="Statement period"><wired-item value="oct" selected>October 2026</wired-item></wired-select><button class="btn-secondary" data-toast="Statement export prepared">${icon('report',16)} Export statement</button></div>
      <div class="table-wrap"><table><thead><tr><th>Date</th><th>Movement</th><th>Ticket</th><th>Approved hours</th><th>Running balance</th><th></th></tr></thead><tbody>
        <tr><td>03 Oct</td><td>Investigation</td><td><button class="table-link" data-screen="CLIENT-04">ST-10468</button></td><td>−3.5 h</td><td>36.5 h</td><td><button class="table-link" data-screen="CLIENT-06">Dispute</button></td></tr>
        <tr><td>09 Oct</td><td>Configuration support</td><td><button class="table-link" data-screen="CLIENT-04">ST-10474</button></td><td>−2 h</td><td>34.5 h</td><td><span class="status">Under dispute</span></td></tr>
        <tr><td>16 Oct</td><td>Incident resolution</td><td><button class="table-link" data-screen="CLIENT-04">ST-10482</button></td><td>−3 h</td><td>31.5 h</td><td><button class="table-link" data-screen="CLIENT-06">Dispute</button></td></tr>
      </tbody></table></div>
      <p class="ledger-note">Pending or rejected worklogs do not affect this balance. SLA elapsed time is shown separately from consumed support hours.</p>
    </article>
  </section>`;
  return `<section class="hour-disputes-layout">
    <section class="hours-summary dispute-summary"><div><label>Open disputes</label><strong>1</strong></div><div><label>Information requested</label><strong>0</strong></div><div><label>Accepted this year</label><strong>2</strong></div><div><label>Rejected this year</label><strong>1</strong></div></section>
    <article class="panel sketch-card">
      <div class="panel-header"><h3>${icon('warning',22)} Support-hour disputes</h3><button class="btn-primary" data-action="open-form" data-mode="create" data-form-action="Submit dispute">${icon('plus',17)} New dispute</button></div>
      <div class="dispute-list"><article class="dispute-item"><div><span class="status dark">Under review</span><h4>DSP-2026-014 · WL-8492</h4><p>2.0 hours disputed from ticket ST-10468 · Submitted 17 Oct 2026</p></div><button class="flow-link" data-toast="Dispute decision timeline opened">View timeline</button></article><article class="dispute-item"><div><span class="status">Accepted</span><h4>DSP-2026-009 · WL-8210</h4><p>1.0 hour corrected and returned to the balance · Closed 02 Sep 2026</p></div><button class="flow-link" data-toast="Dispute decision opened">View decision</button></article></div>
    </article>
  </section>`;
}

function systemSettingsContent() {
  const groups = [
    ["Ticket taxonomy","Categories, issue types, required fields, lifecycle states, and transition rules.","SET-01","3 drafts","warning"],
    ["Routing and priority","Assignment rules, impact and urgency matrix, fallbacks, and conflict order.","RULE-01","1 conflict","warning"],
    ["SLA policies","Response, restoration, resolution targets, pause rules, and escalation thresholds.","SLA-01","12 active","healthy"],
    ["Calendars and holidays","Business hours, time zones, holidays, and emergency coverage calendars.","SLA-03","4 calendars","healthy"],
    ["Response templates","Approved replies, languages, variables, channel scope, and publication status.","SET-02","6 drafts","healthy"],
    ["Recurring schedules","Recurring tickets, reminders, duplicate windows, ownership, and stop rules.","recurring-schedule","5 active","flow"]
  ];
  return `<section class="settings-hub">
    <article class="settings-command sketch-card">
      <div><span class="eyebrow">Configuration workspace</span><h3>${icon('settings',24)} System settings</h3><p>Manage service behavior, validate dependencies, and publish controlled versions.</p></div>
      <div class="settings-command-actions"><wired-search-input placeholder="Search settings, rules, fields..."></wired-search-input><button class="btn-secondary" data-toast="Draft comparison opened">${icon('report',17)} Compare changes</button><button class="btn-primary" data-action="open-form" data-mode="create" data-form-action="Create configuration draft">${icon('plus',17)} New draft</button></div>
    </article>
    <section class="settings-health">
      <article class="metric-card sketch-card"><div>${icon('check',20)}<span>Published version</span></div><strong>v28</strong><small>19 Oct · 08:40 · Mahmoud Nader</small></article>
      <article class="metric-card sketch-card"><div>${icon('report',20)}<span>Open drafts</span></div><strong>9</strong><small>3 require impact review</small></article>
      <article class="metric-card sketch-card"><div>${icon('warning',20)}<span>Configuration warnings</span></div><strong>2</strong><small>Routing conflict and unused field</small></article>
      <article class="metric-card sketch-card"><div>${icon('clock',20)}<span>Scheduled changes</span></div><strong>1</strong><small>Publishes 20 Oct · 00:00</small></article>
    </section>
    <section class="settings-layout">
      <div class="settings-groups">
        <div class="section-title"><div><h3>${icon('settings',22)} Configuration areas</h3><p>Open an area to review its published version, drafts, dependencies, and audit trail.</p></div><span class="status">Role scoped</span></div>
        <div class="settings-card-grid">${groups.map((g,i)=>`<article class="settings-area sketch-card ${g[4]==='warning'?'needs-review':''}"><div class="settings-area-head"><span class="settings-area-icon">${icon(['ticket','arrow','clock','clock','report','bell'][i],23)}</span><span class="status ${g[4]==='warning'?'dark':''}">${g[3]}</span></div><h4>${g[0]}</h4><p>${g[1]}</p><div class="settings-area-meta"><span>${g[4]==='warning'?icon('warning',16):icon('check',16)} ${g[4]==='warning'?'Needs review':'Published configuration'}</span><span>${icon('shield',16)} Versioned</span></div><button class="flow-link" ${g[4]==='flow'?`data-flow="${g[2]}"`:`data-screen="${g[2]}"`}>Open ${g[0].toLowerCase()}</button></article>`).join('')}</div>
      </div>
      <aside class="settings-side">
        <article class="panel sketch-card"><div class="panel-header"><h3>${icon('warning',21)} Needs attention</h3><span class="status dark">2</span></div><div class="settings-alert"><strong>Routing rule conflict</strong><p>Two P1 payment rules have the same order and complete match.</p><button class="flow-link" data-screen="RULE-01">Resolve conflict</button></div><div class="settings-alert"><strong>Unused required field</strong><p>“Affected region” is required but hidden from client ticket intake.</p><button class="flow-link" data-screen="SET-01">Review field</button></div></article>
        <article class="panel sketch-card"><h3>${icon('shield',21)} Publication controls</h3><ul class="list"><li>${icon('check',17)}<span>Impact preview before approval</span></li><li>${icon('people',17)}<span>Maker-checker approval for high-impact changes</span></li><li>${icon('clock',17)}<span>Schedule or publish immediately</span></li><li>${icon('report',17)}<span>Version, rollback point, and audit evidence</span></li></ul><button class="flow-link" data-toast="Publication history opened">Open publication history</button></article>
        <article class="panel sketch-card"><h3>${icon('report',21)} Recent changes</h3><div class="settings-change"><strong>v28 · SLA warning threshold</strong><small>Published today · Mahmoud Nader</small></div><div class="settings-change"><strong>Draft · Payment routing</strong><small>Awaiting review · Lina A.</small></div><div class="settings-change"><strong>v27 · Arabic response template</strong><small>Published yesterday · Service Quality</small></div></article>
      </aside>
    </section>
    <article class="panel sketch-card dependency-panel"><div class="panel-header"><h3>${icon('arrow',21)} Dependency and impact map</h3><button class="btn-secondary" data-toast="Full dependency map opened">Open full map</button></div><div class="dependency-flow"><span>Taxonomy</span><b>→</b><span>Routing</span><b>→</b><span>SLA policy</span><b>→</b><span>Templates</span><b>→</b><span>Notifications</span></div><p>Changing a published category can affect routing, required fields, SLA selection, reports, and client-visible forms. An impact preview is required before publication.</p></article>
  </section>`;
}

function operationsOverviewContent() {
  return `<section class="operations-overview">
    <section class="operations-status-grid"><article class="metric-card sketch-card"><div>${icon('check',20)}<span>Platform services</span></div><strong>12 / 14</strong><small>2 degraded · refreshed 2 min ago</small></article><article class="metric-card sketch-card"><div>${icon('report',20)}<span>Latest backup</span></div><strong>3 h ago</strong><small>Integrity verified · within target</small></article><article class="metric-card sketch-card"><div>${icon('warning',20)}<span>Integration failures</span></div><strong>4</strong><small>Email intake requires review</small></article><article class="metric-card sketch-card"><div>${icon('shield',20)}<span>Compliance tasks</span></div><strong>3</strong><small>1 retention decision overdue</small></article></section>
    <section class="operations-overview-layout"><article class="panel sketch-card"><div class="panel-header"><div><h3>${icon('warning',22)} Current operational status</h3><p>Read-only summary. Open the governed module to investigate or act.</p></div><span class="status dark">3 need attention</span></div><div class="overview-event-list"><article><span class="status dark">Degraded</span><div><strong>Support mailbox ingestion</strong><p>Processing delay is 11 minutes. Four messages remain queued.</p><small>INT-01 · Last check 2 min ago · Platform Ops</small></div><button class="flow-link" data-screen="INT-01">Open integration</button></article><article><span class="status">Warning</span><div><strong>Attachment storage latency</strong><p>Upload latency exceeded the warning threshold; no data loss detected.</p><small>OPS-01 · Last check 4 min ago · Infrastructure</small></div><button class="flow-link" data-screen="OPS-01">Open health</button></article><article><span class="status">Review</span><div><strong>Retention request RET-118</strong><p>Deletion eligibility review is overdue and remains blocked.</p><small>RET-01 · Due yesterday · Compliance</small></div><button class="flow-link" data-screen="RET-01">Open retention</button></article></div></article><aside class="grid operations-overview-side"><article class="panel sketch-card"><h3>${icon('shield',21)} Safe overview rules</h3><ul class="list"><li>${icon('check',17)}<span>No restore, deletion, credential, or retry action runs here.</span></li><li>${icon('lock',17)}<span>Every linked module rechecks role and record scope.</span></li><li>${icon('report',17)}<span>Secrets and sensitive evidence remain masked.</span></li><li>${icon('clock',17)}<span>Stale data is labelled and never shown as healthy.</span></li></ul></article><article class="panel sketch-card"><h3>${icon('arrow',21)} Governed modules</h3><button class="overview-module-link" data-screen="OPS-01">${icon('settings',18)}<span><strong>System health</strong><small>Backups, recovery and service state</small></span></button><button class="overview-module-link" data-screen="AUD-01">${icon('report',18)}<span><strong>Audit log</strong><small>Security and business-critical events</small></span></button><button class="overview-module-link" data-screen="RET-01">${icon('shield',18)}<span><strong>Data retention</strong><small>Holds, exports and controlled deletion</small></span></button><button class="overview-module-link" data-screen="INT-01">${icon('arrow',18)}<span><strong>Integrations</strong><small>Connectors, delivery and exceptions</small></span></button></article></aside></section>
    <article class="panel sketch-card"><div class="panel-header"><h3>${icon('report',22)} Recent governed activity</h3><button class="btn-secondary" data-screen="AUD-01">Open audit log</button></div><div class="table-wrap"><table><thead><tr><th>Time</th><th>Event</th><th>Module</th><th>Owner</th><th>Reference</th><th>State</th></tr></thead><tbody><tr><td>11:42</td><td>Backup integrity verified</td><td>System health</td><td>Platform Ops</td><td>BKP-7741</td><td><span class="status">Complete</span></td></tr><tr><td>11:24</td><td>Email ingestion delay detected</td><td>Integrations</td><td>Platform Ops</td><td>EVT-8824</td><td><span class="status dark">Open</span></td></tr><tr><td>10:55</td><td>Retention review assigned</td><td>Data retention</td><td>Compliance</td><td>RET-118</td><td><span class="status">Review</span></td></tr></tbody></table></div></article>
  </section>`;
}

function roleCatalogContent() {
  const roles = [
    ["SYS-ADMIN","System Administrator","System role","Platform wide","4","Published","Full platform configuration, security controls, integrations, recovery, and audit governance."],
    ["SUP-SUP","Support Supervisor","System role","Assigned teams and clients","12","Published","Monitor queues, assign tickets, manage escalations, approve worklogs, and review service reports."],
    ["SUP-AGENT","Support Agent","System role","Assigned tickets and teams","38","Published","Handle tickets, communicate with clients, add private notes, and record worklogs."],
    ["CL-ADMIN","Client Administrator","System role","Own organization","21","Published","Manage organization users and application scope, view organization tickets, contracts, and hours."],
    ["CL-USER","Client User","System role","Own permitted records","146","Published","Submit and track permitted tickets, reply to support, and view approved client information."],
    ["AUDITOR","Auditor","System role","Approved audit scope","3","Published","Read-only access to approved records, evidence, reports, versions, and audit history."],
    ["SUP-SCOPED","Scoped Support Supervisor","Custom role","Selected teams and clients","8","Draft v1","Supervisory access limited to approved teams, clients, applications, and temporary assignment periods."]
  ];
  return `<section class="role-catalog-workspace">
    <article class="role-catalog-head sketch-card"><div><span class="eyebrow">Identity and access</span><h3>${icon('people',24)} Role catalog</h3><p>Choose a governed role, review its purpose, and open its complete screen permissions.</p></div><div class="record-banner-actions"><button class="btn-secondary" data-screen="IAM-02">${icon('shield',17)} Permission matrix</button><button class="btn-primary" data-action="open-form" data-mode="create" data-form-action="Create custom role">${icon('plus',17)} New custom role</button></div></article>
    <section class="role-summary"><article class="metric-card sketch-card"><div>${icon('shield',20)}<span>System roles</span></div><strong>6</strong><small>Protected role definitions</small></article><article class="metric-card sketch-card"><div>${icon('settings',20)}<span>Custom roles</span></div><strong>1</strong><small>Draft or organization-specific</small></article><article class="metric-card sketch-card"><div>${icon('people',20)}<span>Assignments</span></div><strong>232</strong><small>Across provider and client users</small></article><article class="metric-card sketch-card"><div>${icon('warning',20)}<span>Reviews due</span></div><strong>5</strong><small>Privileged assignments</small></article></section>
    <article class="panel sketch-card"><div class="panel-header"><div><h3>${icon('people',22)} Available roles</h3><p>System roles cannot be deleted. Custom roles follow draft, approval, publication, and deprecation controls.</p></div><span class="status">7 roles</span></div><div class="role-catalog-filters"><wired-search-input placeholder="Search role name, code, or capability"></wired-search-input><select class="sketch-select"><option>All role types</option><option>System roles</option><option>Custom roles</option></select><select class="sketch-select"><option>All audiences</option><option>Provider users</option><option>Client users</option><option>Auditors</option></select></div><div class="role-card-grid">${roles.map((role,index)=>`<article class="role-card ${role[2]==='Custom role'?'custom':''}"><div class="role-card-top"><span class="role-symbol">${icon(index===5?'report':index<3?'shield':'user',23)}</span><span class="status ${role[5].includes('Draft')?'dark':''}">${role[5]}</span></div><span class="eyebrow">${role[0]} · ${role[2]}</span><h4>${role[1]}</h4><p>${role[6]}</p><div class="role-facts"><div><label>Data scope</label><strong>${role[3]}</strong></div><div><label>Assigned users</label><strong>${role[4]}</strong></div></div><div class="role-actions"><button class="flow-link" data-screen="IAM-02">Open permissions</button><button class="text-action" data-action="open-form" data-mode="edit" data-form-action="Review ${role[1]}">${role[2]==='Custom role'?'Edit draft':'View role'}</button></div></article>`).join('')}</div></article>
    <section class="permission-bottom-grid"><article class="panel sketch-card"><h3>${icon('shield',21)} Role governance</h3><ul class="list"><li>${icon('check',17)}<span>System roles are protected and versioned.</span></li><li>${icon('lock',17)}<span>Users cannot grant or approve their own elevated access.</span></li><li>${icon('warning',17)}<span>Toxic role combinations are blocked before assignment.</span></li><li>${icon('report',17)}<span>Every role and assignment change is audited.</span></li></ul></article><article class="panel sketch-card"><h3>${icon('people',21)} Assignment guidance</h3><div class="flow-facts"><div><label>Provider staff</label><strong>Support Agent or Supervisor</strong></div><div><label>Client staff</label><strong>Client User or Administrator</strong></div><div><label>Independent review</label><strong>Auditor — read only</strong></div><div><label>Platform control</label><strong>System Administrator</strong></div></div></article></section>
  </section>`;
}

function permissionMatrixContent() {
  const modules = [...new Set(state.screens.map(screen => screen.module))].sort();
  const capability = (screen, type) => {
    const actions = split(screen.primary_actions).join(' ').toLowerCase();
    const rules = {
      create:/create|add|invite|submit|upload|reply|request|start|run/,
      edit:/edit|change|assign|reassign|update|correct|configure|set scope|reorder/,
      approve:/approve|publish|activate|reject|decision|resolve|close/,
      admin:/delete|deactivate|restore|retention|credential|role|permission/
    };
    if (type === 'view') return true;
    return rules[type].test(actions);
  };
  const scopeFor = screen => screen.screen_id.startsWith('CLIENT') ? 'Own organization' : /contract|hour/i.test(screen.module) ? 'Assigned contracts' : /identity|administration|settings|operations/i.test(screen.module) ? 'Authorized administration scope' : 'Assigned teams and clients';
  const panelsFor = screen => {
    const panels = [...new Set(state.nav.filter(item => item.target_screen_id === screen.screen_id).map(item => item.panel_id))];
    return panels.length ? panels.map(p => p[0] + p.slice(1).toLowerCase()).join(' · ') : 'Shared';
  };
  return `<section class="permission-workspace">
    <article class="permission-toolbar sketch-card">
      <div><span class="eyebrow">Role permission workspace</span><h3>${icon('shield',24)} Complete screen permission matrix</h3><p>Review effective access for every screen before publishing the role version.</p></div>
      <div class="permission-role"><label>Selected role</label><select class="sketch-select"><option>Security Administrator</option><option>Provider Administrator</option><option>Support Supervisor</option><option>Support Agent</option><option>Client Administrator</option><option>Client User</option><option>Auditor — read only</option></select><button class="btn-secondary" data-toast="Role comparison opened">${icon('people',17)} Compare roles</button></div>
    </article>
    <section class="permission-summary">
      <article class="metric-card sketch-card"><div>${icon('report',20)}<span>Catalog coverage</span></div><strong>${state.screens.length} / ${state.screens.length}</strong><small>Every catalog screen is represented</small></article>
      <article class="metric-card sketch-card"><div>${icon('check',20)}<span>Allowed capabilities</span></div><strong>164</strong><small>Direct and inherited decisions</small></article>
      <article class="metric-card sketch-card"><div>${icon('warning',20)}<span>Conditional</span></div><strong>21</strong><small>Scope or approval required</small></article>
      <article class="metric-card sketch-card"><div>${icon('shield',20)}<span>Conflicts</span></div><strong>0</strong><small>Separation-of-duty validation passed</small></article>
    </section>
    <article class="panel sketch-card permission-matrix-panel">
      <div class="panel-header"><div><h3>${icon('settings',22)} Screen permissions</h3><p>One row per screen. Changes remain draft until reviewed and published.</p></div><span class="status">Draft v12</span></div>
      <div class="permission-filters"><label class="permission-search-field"><span>${icon('search',16)} Search screens</span><input type="search" data-permission-search placeholder="Name, ID, or module"></label><select class="sketch-select" data-permission-panel aria-label="Panel filter"><option>All panels</option><option>Client</option><option>Support</option><option>Admin</option></select><select class="sketch-select" data-permission-module-filter aria-label="Module filter"><option>All modules (${modules.length})</option>${modules.map(m=>`<option>${esc(m)}</option>`).join('')}</select><select class="sketch-select" data-permission-decision aria-label="Decision filter"><option>All decisions</option><option>Allow</option><option>Conditional</option><option>Deny</option></select><label class="permission-change-filter"><input type="checkbox" data-permission-changed> Changed only</label><button class="btn-secondary" data-permission-apply>Apply filters</button></div>
      <div class="permission-legend"><span><i class="decision allow">✓</i> Allow</span><span><i class="decision conditional">◐</i> Conditional</span><span><i class="decision deny">—</i> Deny</span><span>${icon('lock',16)} Explicit scope required</span></div>
      <div class="permission-scroll-note">${icon('arrow',16)} Open one module at a time. The screen name and table heading remain fixed while you review decisions.</div>
      <div class="table-wrap permission-table"><table><colgroup><col class="col-screen"><col class="col-panel"><col span="5" class="col-capability"><col class="col-scope"><col class="col-source"><col class="col-action"></colgroup><thead><tr><th>Screen</th><th>Used in</th><th title="View">View</th><th title="Create">Create</th><th title="Edit">Edit</th><th title="Approve">Approve</th><th title="Administer">Admin</th><th>Record scope</th><th>Source</th><th>Action</th></tr></thead><tbody>${modules.map(module => {const open=state.permissionOpenModules.includes(module);return `<tr class="permission-module-row" data-permission-group="${esc(module)}"><th colspan="10"><button data-permission-module="${esc(module)}" aria-expanded="${open}">${icon(iconFor(module),17)}<span>${esc(module)} <small>${state.screens.filter(s=>s.module===module).length} screens</small></span>${icon('arrow',15)}</button></th></tr>${state.screens.filter(s=>s.module===module).map((screen,index)=>{const cell=type=>{const allowed=capability(screen,type);const conditional=allowed&&type!=='view'&&(index+type.length)%3===0;const decision=allowed?(conditional?'Conditional':'Allow'):'Deny';return `<td class="capability-cell"><button class="permission-decision ${decision.toLowerCase()}" data-toast="${esc(type)} permission for ${esc(screen.screen_id)} selected" aria-label="${decision} ${type}" title="${decision}: ${type}"><span>${allowed?(conditional?'◐':'✓'):'—'}</span><small>${decision}</small></button></td>`};const source=index%3===0?'Direct':index%3===1?'Inherited':'Default';const panels=panelsFor(screen);return `<tr class="permission-screen-row" data-module="${esc(module)}" data-panels="${esc(panels)}" data-changed="${index%4===0?'true':'false'}" ${open?'':'hidden'}><td><strong>${esc(screen.screen_id)}</strong><span>${esc(screen.screen_name)}</span></td><td><span class="panel-tags">${panels.split(' · ').map(p=>`<i>${esc(p)}</i>`).join('')}</span></td>${cell('view')}${cell('create')}${cell('edit')}${cell('approve')}${cell('admin')}<td><span class="scope-value">${icon('lock',14)} ${esc(scopeFor(screen))}</span></td><td><span class="permission-source ${source.toLowerCase()}">${source}</span></td><td><button class="table-link permission-configure" data-action="open-form" data-mode="edit" data-form-action="Configure ${esc(screen.screen_id)} permissions">Configure</button></td></tr>`}).join('')}`}).join('')}</tbody></table></div>
    </article>
    <section class="permission-bottom-grid"><article class="panel sketch-card"><h3>${icon('warning',21)} Validation rules</h3><ul class="list"><li>${icon('check',17)}<span>Default deny for every unselected capability.</span></li><li>${icon('lock',17)}<span>Record scope is mandatory for view and mutation access.</span></li><li>${icon('people',17)}<span>No self-elevation or conflicting approval permissions.</span></li><li>${icon('report',17)}<span>Publishing retains the previous version and affected-user evidence.</span></li></ul></article><article class="panel sketch-card"><h3>${icon('people',21)} Impact preview</h3><div class="flow-facts"><div><label>Affected users</label><strong>8</strong></div><div><label>Added grants</label><strong>3</strong></div><div><label>Removed grants</label><strong>0</strong></div><div><label>Approval</label><strong>Security owner required</strong></div></div></article></section>
    <div class="flow-footer"><button class="btn-secondary" data-toast="Permission draft saved">${icon('report',17)} Save draft</button><button class="btn-secondary" data-toast="Conflict validation completed">${icon('shield',17)} Validate conflicts</button><button class="btn-primary" data-action="open-form" data-mode="create" data-form-action="Submit permission matrix for approval">${icon('check',17)} Submit for approval</button></div>
  </section>`;
}

const specializedBlueprints = {
  "PROV-05": { kind:"search", title:"Search across authorized records", metrics:[["Result types","5","Tickets, clients, contracts, users, applications"],["Visible results","24","Limited to your current scope"],["Recent searches","6","Private to your account"]], columns:["Type","Reference","Matched content","Context","Updated"], rows:[["Ticket","ST-10482","Payment confirmation fails","Northstar Retail · P2","14 min ago"],["Client","ORG-0042","Northstar Retail","Active · Premium support","Today"],["Contract","CON-2026-018","Premium Support","31.5 h available","Today"],["Application","APP-COM-01","Commerce API","Production · Supported","Yesterday"]], side:"Search guidance", bullets:["Use quoted text for exact matches","Filters never expand access scope","Restricted records are not disclosed"] },
  "ORG-02": { kind:"detail", title:"Northstar Retail", subtitle:"Active B2B client · Account owner: Sarah Morgan", metrics:[["Open tickets","7","2 need client input"],["Applications","3","All currently supported"],["Contract balance","31.5 h","Premium Support"],["Active users","12","1 invitation pending"]], columns:["Relationship","Reference","Name","State","Owner"], rows:[["Application","APP-COM-01","Commerce API","Production","Maya Chen"],["Contract","CON-2026-018","Premium Support","Active","Sarah Morgan"],["Primary contact","USR-CL-091","Maya Chen","Verified","Client administrator"]], side:"Account activity", bullets:["Last review completed 12 Oct 2026","Domain northstar.example verified","Renewal review starts in 45 days"] },
  "APP-01": { kind:"queue", title:"Supported applications", metrics:[["Supported","38","Across 42 clients"],["Production critical","11","Enhanced escalation"],["Coverage gaps","3","Contract review required"]], columns:["Application","Client","Environment","Criticality","Coverage","Owner"], rows:[["Commerce API","Northstar Retail","Production","High","Premium · Covered","Maya Chen"],["Patient Portal","Gulf Health Group","Production","Critical","Enterprise · Covered","Nina Das"],["Fleet Gateway","Atlas Logistics","UAT","Medium","Standard · Limited","Omar Khalid"]], side:"Application readiness", bullets:["2 applications need owner confirmation","1 production version is unsupported","Integration health checked 8 min ago"] },
  "TEAM-01": { kind:"queue", title:"Support teams and capacity", metrics:[["Teams","7","Across 3 departments"],["Available agents","31","Current shift"],["Queues at risk","2","Capacity above 85%"]], columns:["Team","Department","Lead","On shift","Queue load","Coverage"], rows:[["Payment Support","Application Support","Nina Das","6 / 8","82%","24 × 7"],["Platform Operations","Infrastructure","Omar Khalid","4 / 6","64%","06:00–22:00"],["Security Response","Security Operations","Farah Khan","2 / 4","91%","On call"]], side:"Assignment health", bullets:["Payment Support reaches capacity in 45 minutes","Security escalation fallback is active","Skills coverage reviewed weekly"] },
  "RULE-01": { kind:"rules", title:"Routing and priority rules", metrics:[["Published rules","18","Ordered evaluation"],["Conflicts","1","Needs resolution"],["Matched today","146","94% auto-routed"]], columns:["Order","Rule","When","Then","Hits","State"], rows:[["01","Critical production outage","Environment = Production and impact = All users","P1 · Engineering Escalation","12","Published"],["02","Payment incidents","Category = Payments","Payment Support","48","Published"],["03","Unverified email","Source = Email and identity = Unknown","Intake exceptions","7","Review"]], side:"Simulation", bullets:["Sample: Production payment outage","Matched rule 01 before rule 02","Result: P1 · Engineering Escalation"] },
  "CONT-02": { kind:"detail", title:"CON-2026-018 · Premium Support", subtitle:"Northstar Retail · Active until 31 Dec 2026", metrics:[["Model","Purchased hours","Scope remains contract-controlled"],["Purchased","40 h","Current contract year"],["Available","31.5 h","Above warning threshold"],["Current version","v3","Effective 01 Jul 2026"]], columns:["Version","Entitlement model","Effective period","Change summary","Approval","Document"], rows:[["v3","Purchased hours · 40 h","01 Jul–31 Dec 2026","Added Commerce API production coverage","Approved 28 Jun","Signed PDF"],["v2","Annual unlimited","01 Apr–30 Jun 2026","Unlimited effort within listed services only","Approved 25 Mar","Signed PDF"],["v1","Purchased hours · 24 h","01 Jan–31 Mar 2026","Initial agreement","Approved 20 Dec","Signed PDF"]], side:"Contract controls", bullets:["Unlimited never expands service scope or coverage hours","Suspended contracts require exception approval","Approved ticket snapshots remain historical"] },
  "CONT-03": { kind:"matrix", title:"Contract coverage matrix", metrics:[["Applications","2","Covered"],["Service types","3","Incident, request, advisory"],["Exclusions","2","Visible below"]], columns:["Application / service","Incident","Request","Advisory","Hours","Escalation"], rows:[["Commerce API","Covered","Covered","Limited","24 × 7","Level 2"],["Customer Portal","Covered","Covered","Not covered","Business hours","Level 1"],["New development","Excluded","Excluded","Excluded","—","—"]], side:"Coverage notes", bullets:["P1 incidents use the critical SLA","Enhancement work requires approval","Coverage snapshot is saved with each ticket"] },
  "CONT-04": { kind:"ledger", title:"Contract hour ledger", metrics:[["Opening balance","40 h","01 Jan 2026"],["Approved deductions","8.5 h","3 posted entries"],["Reserved","2 h","Pending approval"],["Available","31.5 h","Posted balance"]], columns:["Date","Entry","Linked record","Credit","Debit","Running balance","Approval"], rows:[["16 Oct","Incident resolution","ST-10482 · WL-8501","—","3.0 h","31.5 h","Approved"],["09 Oct","Configuration support","ST-10474 · WL-8492","—","2.0 h","34.5 h","Disputed"],["03 Oct","Investigation","ST-10468 · WL-8460","—","3.5 h","36.5 h","Approved"],["01 Jan","Purchased entitlement","CON-2026-018","40 h","—","40 h","Posted"]], side:"Reconciliation", bullets:["Ledger balances to approved worklogs","Pending hours do not reduce balance","SLA elapsed time is excluded"] },
  "CONT-05": { kind:"queue", title:"Exception and overage approvals", metrics:[["Pending","6","2 due today"],["Requested hours","18 h","Across 4 clients"],["Approved this month","11 h","Within authority"]], columns:["Request","Client / ticket","Type","Requested","Impact","Approver","State"], rows:[["EXC-204","Northstar · ST-10482","Overage","6 h","Production outage","Duty Manager","Pending"],["EXC-198","Atlas · ST-10474","Coverage exception","3 h","High","Sarah Morgan","Needs info"],["EXC-191","Gulf Health · ST-10468","Emergency approval","9 h","Critical","Operations Director","Approved"]], side:"Decision evidence", bullets:["Contract impact is shown before approval","Authority limit: 8 hours","Every decision requires a reason"] },
  "CONT-06": { kind:"timeline", title:"Renewal and expiry alerts", metrics:[["Due in 30 days","6","2 high risk"],["Notice windows open","4","Owner action required"],["Low-balance contracts","3","Forecast before renewal"]], columns:["Date","Milestone","Owner","Risk","Next action"], rows:[["21 Oct","Renewal review starts · Gulf Health","Sarah Morgan","High","Confirm scope"],["01 Nov","Notice deadline · Atlas Logistics","Omar Khalid","Medium","Send proposal"],["31 Dec","Northstar contract expires","Sarah Morgan","Low","Complete renewal"]], side:"Renewal forecast", bullets:["Northstar forecast balance: 18 h","Unused-hour treatment needs confirmation","Client contact reminder scheduled"] },
  "SLA-01": { kind:"matrix", title:"SLA policies and targets", metrics:[["Published policies","6","Across 3 service tiers"],["Priorities","4","P1 to P4"],["Target clocks","3","Tracked independently"],["Policy reviews","2","Due this quarter"]], columns:["Policy","Priority","First response","Restoration","Resolution","Calendar","Pause rule","State"], rows:[["Premium Critical","P1","15 min","2 h","4 h","24 × 7","Client input only","Published"],["Premium High","P2","30 min","4 h","8 h","24 × 7","Client input only","Published"],["Standard Normal","P3","4 h","1 day","3 days","Business hours","Approved waiting","Published"]], side:"Applicability", bullets:["Each target runs and breaches independently","Policy version is snapshotted on ticket creation","Target changes require approval"] },
  "SLA-02": { kind:"simulation", title:"SLA policy simulation", metrics:[["First response","10:12","30-minute target"],["Restoration","14:24","Includes approved pause"],["Resolution","18:24","Includes approved pause"],["Timezone","Asia/Bahrain","24 × 7 calendar"]], columns:["Step","Event","Response","Restoration","Resolution"], rows:[["1","Ticket created · 09:42","Due 10:12","Due 13:42","Due 17:42"],["2","Waiting for client · 11:10","Met","Paused","Paused"],["3","Client replied · 11:58","Met","Due 14:30","Due 18:30"]], side:"Simulation inputs", bullets:["Production · Multiple users blocked","Three contractual clocks calculated separately","Pause event adds 48 minutes to active targets"] },
  "SLA-03": { kind:"calendar", title:"Business calendars and holidays", metrics:[["Calendars","4","One default"],["Upcoming holidays","3","Next 90 days"],["Affected policies","6","Preview before publish"]], columns:["Day","Working window","Break","Coverage","Exception"], rows:[["Sunday–Thursday","08:00–17:00","12:30–13:30","Business hours","None"],["Friday","—","—","Closed","On-call only"],["Saturday","—","—","Closed","On-call only"]], side:"Upcoming exceptions", bullets:["16 Dec · National Day · Closed","17 Dec · National Day holiday · Closed","31 Dec · Early close at 14:00"] },
  "SLA-04": { kind:"queue", title:"SLA risk and breach queue", metrics:[["At risk","14","Next target in 38 min"],["Breached","3","Manager action required"],["Escalated","7","Level 2 or above"]], columns:["Ticket","Client","Target","Remaining","Cause","Owner","Escalation"], rows:[["ST-10474","Atlas Logistics","P1 resolution","38 min","Pending specialist","Omar Khalid","Level 2"],["ST-10479","Gulf Health","P2 response","1 h 12 m","Unassigned","Application Support","Level 1"],["ST-10461","Northstar Retail","P2 resolution","Breached 22 m","Dependency failure","Mahmoud Nader","Manager"]], side:"Immediate actions", bullets:["Assign ST-10479 before response breach","Manager acknowledgement required for ST-10461","Client-safe update due in 15 minutes"] },
  "WL-02": { kind:"queue", title:"Worklog approval queue", metrics:[["Pending","23","11 older than one day"],["Hours awaiting approval","47.5 h","6 contracts affected"],["Exceptions","4","Overlap or coverage issue"]], columns:["Worklog","Agent","Ticket","Activity","Duration","Coverage","Contract impact","State"], rows:[["WL-8501","Mahmoud Nader","ST-10482","Incident resolution","3.0 h","Covered","−3.0 h pending","Pending"],["WL-8492","Omar Khalid","ST-10474","Configuration","2.0 h","Covered","Disputed","Review"],["WL-8487","Nina Das","ST-10479","Internal coordination","0.5 h","Not billable","No deduction","Exception"]], side:"Approval checks", bullets:["Duration overlap detected on WL-8487","Coverage snapshot matches contract version","Approved entries post to the ledger"] },
  "AUD-01": { kind:"audit", title:"Audit evidence explorer", metrics:[["Events today","1,248","Across authorized scope"],["Material changes","86","Before/after retained"],["Export requests","2","Approval required"]], columns:["Time","Actor","Action","Entity","Before → after","Source","Correlation"], rows:[["11:42","Sarah Morgan","Priority override","ST-10482","P2 → P1","Web · 10.0.4.18","COR-8H2K"],["11:18","Mahmoud Nader","Worklog submitted","WL-8501","Draft → Pending","Web · 10.0.4.31","COR-7Q4M"],["10:56","System","Email intake matched","MAIL-2094","Unknown → Northstar","Worker","COR-6P1A"]], side:"Evidence controls", bullets:["Exports require a reason and approval","Timestamps use UTC plus viewer timezone","Before/after values are immutable"] },
  "RET-01": { kind:"timeline", title:"Retention and controlled deletion", metrics:[["Policies","7","By record class"],["Eligible records","12,480","Preview only"],["Legal holds","3","Deletion blocked"]], columns:["Record class","Retention","Eligible","Hold","Next execution"], rows:[["Closed tickets","7 years","8,240","2 holds","01 Nov 2026"],["Audit evidence","10 years","0","Immutable","Not eligible"],["Email intake payloads","180 days","4,240","1 hold","20 Oct 2026"]], side:"Deletion safeguards", bullets:["Eligibility preview precedes approval","Legal holds override retention","Execution produces immutable evidence"] },
  "OPS-01": { kind:"operations", title:"Backup, restore, and platform health", metrics:[["Service health","12 / 14","2 degraded"],["Latest backup","3 h ago","Integrity verified"],["Recovery target","RPO 4 h","RTO 2 h"]], columns:["Component","Health","Last check","Recovery point","Test status","Owner"], rows:[["Primary database","Healthy","2 min ago","02:00 UTC","Restore passed","Platform Ops"],["Attachment storage","Degraded","4 min ago","01:45 UTC","Latency warning","Infrastructure"],["Search index","Healthy","1 min ago","Rebuildable","Tested 12 Oct","Platform Ops"]], side:"Recovery readiness", bullets:["Latest restore rehearsal: 05 Oct","Evidence package approved","Production restore requires two approvers"] },
  "INT-01": { kind:"integrations", title:"Integrations and channels", metrics:[["Connected","8","6 production"],["Degraded","1","Email ingestion delay"],["Failed events","14","Retry available"]], columns:["Connector","Type","Environment","Credential state","Last event","Health","Owner"], rows:[["Support mailbox","Email intake","Production","Valid · 42 days","2 min ago","Degraded","Platform Ops"],["Client SSO","SAML","Production","Valid","8 min ago","Healthy","Identity Team"],["Teams alerts","Webhook","Production","Rotates in 12 days","1 min ago","Healthy","Support Ops"]], side:"Connector actions", bullets:["Test runs use non-production payloads","Secret values are never displayed","Failures link to delivery evidence"] },
  "INT-02": { kind:"queue", title:"Email intake exceptions", metrics:[["Unmatched","12","Identity or client mapping"],["Parsing failures","4","Attachment or body"],["Quarantined","2","Security review"]], columns:["Message","Sender","Received","Failure","Proposed match","Security","Next action"], rows:[["MAIL-2094","maya@northstar.example","11:24","Contact not mapped","Northstar Retail","Passed","Verify and draft"],["MAIL-2091","alerts@unknown.example","10:48","Organization unknown","No match","Quarantined","Security review"],["MAIL-2088","nina@gulfhealth.example","09:16","Attachment unreadable","Gulf Health","Passed","Request resend"]], side:"Exception handling", bullets:["Verify identity before ticket creation","Original message remains immutable","Duplicate detection runs on retry"] },
  "REP-01": { kind:"report", title:"SLA compliance report", metrics:[["Compliance","94.2%","+1.8% vs previous period"],["Breached tickets","18","6 fewer than last month"],["Median resolution","5.4 h","Target varies by policy"]], columns:["Segment","Tickets","Met","Breached","Compliance","Trend"], rows:[["Premium clients","184","177","7","96.2%","Up 1.1%"],["Standard clients","326","302","24","92.6%","Up 2.4%"],["P1 incidents","21","19","2","90.5%","Down 1.2%"]], side:"Report definition", bullets:["Denominator: resolved tickets with an SLA","Paused time uses approved policy states","Click any segment to drill into tickets"] },
  "REP-02": { kind:"report", title:"Support-hour usage report", metrics:[["Entitlement","1,840 h","Active contracts"],["Approved usage","1,214 h","66% consumed"],["Forecast balance","412 h","At renewal dates"]], columns:["Client","Entitlement","Approved","Pending","Available","Forecast","Risk"], rows:[["Northstar Retail","40 h","8.5 h","2 h","31.5 h","18 h","Low"],["Gulf Health Group","120 h","94 h","6 h","26 h","4 h","High"],["Atlas Logistics","60 h","55.5 h","1.5 h","4.5 h","0 h","Critical"]], side:"Reconciliation", bullets:["Approved ledger movements only","Pending usage shown separately","SLA time is excluded from consumption"] },
  "REP-03": { kind:"report", title:"Service and ticket analytics", metrics:[["Created","548","+8% vs previous period"],["Resolved","512","94% completion"],["Median age","18 h","Down 2.1 h"],["Reopen rate","4.6%","Target below 5%"]], columns:["Category","Created","Resolved","Backlog","Median resolution","Reopen rate"], rows:[["Payments","148","139","24","4.8 h","3.1%"],["Access and identity","122","118","11","3.2 h","5.4%"],["Infrastructure","86","79","18","8.6 h","4.2%"]], side:"Analytics notes", bullets:["Volume peaked on 14 Oct","Payment backlog is concentrated in one release","Identity reopen rate needs review"] },
  "SET-01": { kind:"taxonomy", title:"Ticket taxonomy and lifecycle", metrics:[["Issue types","29","26 published"],["Lifecycle states","8","Role-controlled"],["Configuration warnings","2","Impact review required"]], columns:["Path","Department","Default priority","SLA mapping","Required fields","Usage","State"], rows:[["Incident › Payments › Processing failure","Application Support","P2","Premium High","Environment, occurrence","148","Published"],["Incident › Access › Sign-in issue","Application Support","P2","Standard High","User impact","122","Published"],["Request › Access › New role","Identity","P3","Request Standard","Role, scope","64","Draft"]], side:"Lifecycle preview", bullets:["New → Triaged → In Progress","Waiting for Client pauses eligible SLAs","Resolved → Closed; reopen requires reason"] },
  "SET-02": { kind:"templates", title:"Response templates", metrics:[["Published","34","Across 2 languages"],["Drafts","6","Awaiting review"],["Usage this month","482","12% manually edited"]], columns:["Template","Channel","Language","Scope","Version","Usage","State"], rows:[["Incident acknowledgement","Portal + Email","English","All incidents","v4","184","Published"],["Client input required","Portal","English / Arabic","Waiting state","v2","128","Published"],["Resolution summary","Portal + Email","English","Payment issues","v3","76","Review due"]], side:"Template preview", bullets:["Variables: client, ticket, next update","Missing variables block publish","Preview masks internal-only data"] },
  "WL-03": { kind:"worklog", title:"My worklogs", metrics:[["This week","31.5 h","Target 40 h"],["Pending","6.5 h","4 entries"],["Returned","1","Correction required"]], columns:["Date","Ticket","Activity","Duration","Billable","State","Edit until"], rows:[["18 Oct","ST-10482","Incident resolution","3.0 h","Yes","Pending","Approval"],["18 Oct","ST-10479","Client update","0.5 h","No","Draft","End of day"],["17 Oct","ST-10474","Configuration","2.0 h","Yes","Returned","20 Oct"]], side:"Week completeness", bullets:["Monday: 8 h complete","Tuesday: 7 h logged · 1 h missing","Returned entry needs a correction reason"] },
  "APR-01": { kind:"queue", title:"Approvals center", metrics:[["Assigned to me","14","5 due today"],["High impact","4","Contract or access"],["Overdue","2","Escalation started"]], columns:["Request","Type","Requester","Impact","Submitted","Deadline","Chain","State"], rows:[["EXC-204","Support-hour overage","Mahmoud Nader","6 h · Production","Today 09:12","Today 16:00","1 of 2","Pending"],["IAM-2841","Scoped supervisor role","Nina Das","High access","Yesterday","Today","2 of 2","Pending"],["RET-118","Controlled deletion","System","12,480 records","16 Oct","20 Oct","1 of 3","Needs info"]], side:"Decision checklist", bullets:["Open evidence before deciding","Conflicts of interest require reassignment","Reason is mandatory for every decision"] },
  "REP-00": { kind:"hub", title:"Reports library", metrics:[["Available reports","12","Based on your permissions"],["Favorites","4","Pinned for quick access"],["Freshness alerts","1","Usage report delayed"]], columns:["Report","Purpose","Audience","Freshness","Owner","Access"], rows:[["SLA compliance","Targets and breach trends","Support leadership","8 min ago","Service Quality","Open"],["Support-hour usage","Entitlement and consumption","Account + Finance","Delayed 22 min","Commercial Ops","Open"],["Service analytics","Volume, backlog, resolution","Operations","5 min ago","Support Ops","Open"]], side:"Recently viewed", bullets:["SLA compliance · 12 minutes ago","Northstar hour usage · Yesterday","Payment category trend · 15 Oct"] },
  "SET-00": { kind:"hub", title:"Service configuration hub", metrics:[["Configuration areas","8","Role-scoped"],["Warnings","2","Impact review required"],["Recent changes","7","Last 24 hours"]], columns:["Configuration area","Purpose","Health","Dependencies","Last change","Owner"], rows:[["Ticket taxonomy","Classification and lifecycle","Warning","Routing, SLA","Today 10:22","Support Ops"],["Response templates","Approved client messages","Healthy","Channels","Yesterday","Service Quality"],["Routing rules","Assignment and priority","Conflict","Teams, taxonomy","16 Oct","Support Ops"]], side:"Change safety", bullets:["Impact preview required before publish","Draft changes do not affect live tickets","Every publish creates a version"] }
};

function specializedScreenContent(screen) {
  const bp = specializedBlueprints[screen.screen_id];
  if (!bp) return "";
  const gapActions = ({
    "CONT-02":[["contract-model","Contract model"]],
    "CONT-04":[["hour-finance","Financial workflow"]],
    "SLA-02":[["sla-multi-clock","Multi-target timeline"]],
    "WL-02":[["hour-finance","Hours and finance"]],
    "INT-01":[["channel-intake","Channel intake"]],
    "INT-02":[["email-to-ticket","Verified email intake"]],
    "SET-00":[["recurring-schedule","Recurring schedules"]]
  })[screen.screen_id] || [];
  const reportKinds = new Set(["report","simulation"]);
  const metricCards = `<section class="grid specialized-metrics">${bp.metrics.map((m,i)=>`<article class="metric-card sketch-card"><div>${icon(["report","clock","contract","warning"][i%4],20)}<span>${esc(m[0])}</span></div><strong>${esc(m[1])}</strong><small>${esc(m[2])}</small></article>`).join("")}</section>`;
  const visual = reportKinds.has(bp.kind) ? `<article class="panel sketch-card visual-panel"><div class="panel-header"><h3>${icon('report',22)} ${bp.kind==='simulation'?'Calculated timeline':'Trend and comparison'}</h3><span class="status">Interactive preview</span></div><div class="bar-chart" aria-label="Wireframe chart">${[74,52,91,64,82,70].map((h,i)=>`<div><span style="height:${h}%"></span><small>${['May','Jun','Jul','Aug','Sep','Oct'][i]}</small></div>`).join('')}</div></article>` : "";
  const kindNote = ({ledger:"Posted entries update the running balance only after approval.",matrix:"Select a row to inspect applicability and inherited rules.",calendar:"Publishing a calendar change previews every affected SLA target.",audit:"Sensitive values remain masked unless the viewer has evidence access.",rules:"Rules run from top to bottom; the first complete match wins.",integrations:"Credentials are write-only and never shown after saving.",taxonomy:"Archiving a used type preserves historical ticket classification.",templates:"Preview renders variables with safe sample data before publishing.",worklog:"Submitted worklogs remain editable only until approval begins.",operations:"Restore actions use a controlled approval and evidence workflow."})[bp.kind] || "Select a row to open its complete context and permitted actions.";
  return `<section class="specialized-screen ${esc(bp.kind)}">
    <article class="record-banner sketch-card"><div><span class="eyebrow">${esc(screen.screen_id)} · ${esc(bp.kind)}</span><h3>${icon(iconFor(screen.screen_name),24)} ${esc(bp.title)}</h3>${bp.subtitle?`<p>${esc(bp.subtitle)}</p>`:""}</div><div class="record-banner-actions"><button class="btn-secondary" data-toast="Filters opened">${icon('search',16)} Filters</button>${gapActions.map(a=>`<button class="btn-secondary" data-flow="${a[0]}">${icon('arrow',16)} ${a[1]}</button>`).join('')}<button class="btn-primary" data-action="open-form" data-mode="create" data-form-action="${esc(split(screen.primary_actions)[0] || 'Create record')}">${icon('plus',16)} ${esc(split(screen.primary_actions)[0] || 'Create record')}</button></div></article>
    ${metricCards}${visual}
    <section class="specialized-main">
      <article class="panel sketch-card"><div class="panel-header"><h3>${icon(bp.kind==='ledger'?'contract':bp.kind==='audit'?'shield':'ticket',22)} ${esc(bp.title)}</h3><span class="status">Live prototype data</span></div><div class="specialized-filter"><wired-search-input placeholder="Search this view"></wired-search-input><select class="sketch-select"><option>All relevant states</option><option>Needs attention</option></select><button class="btn-secondary" data-toast="View exported">${icon('report',16)} Export</button></div><div class="table-wrap"><table><thead><tr>${bp.columns.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${bp.rows.map((row,ri)=>`<tr data-action="open-form" data-mode="edit" data-form-action="Review ${esc(row[0])}" aria-label="Review ${esc(row[0])}">${row.map((cell,ci)=>`<td>${ci===row.length-1?`<span class="status ${/high|critical|breach|pending|review|degraded|warning/i.test(cell)?'dark':''}">${esc(cell)}</span>`:esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="specialized-note">${icon('shield',16)} ${esc(kindNote)}</p></article>
      <aside class="panel sketch-card insight-panel"><h3>${icon('warning',21)} ${esc(bp.side)}</h3><ul class="list">${bp.bullets.map((b,i)=>`<li>${icon(i===0?'warning':'check',17)}<span>${esc(b)}</span></li>`).join('')}</ul><button class="flow-link" data-action="open-form" data-mode="edit" data-form-action="Review ${esc(bp.side)}">Open detailed review</button></aside>
    </section>
  </section>`;
}

const gapFlowDefinitions = {
  "ticket-accepted": {
    title:"Ticket accepted",
    description:"The request is now part of the support workflow.",
    code:"FLOW-ACCEPT",
    summary:[["Ticket number","ST-10496"],["Accepted","19 Oct 2026 · 10:24"],["Owner","Payment Support queue"],["Priority","P2 — High"]],
    sections:[
      ["Contract and SLA snapshot",[["Contract","CON-2026-018 · Premium Support"],["Coverage","Covered · snapshot v3 retained"],["First response due","19 Oct · 10:54"],["Service restoration due","19 Oct · 14:24"],["Permanent resolution due","19 Oct · 18:24"]]],
      ["Confirmation and next steps",[["Requester","Maya Chen · verified"],["Notification","Portal and email queued"],["Next update","By 11:15"],["Reference","Acceptance event EVT-77421"]]]
    ],
    actions:[["Open ticket","CLIENT-04"],["Submit another ticket","CLIENT-03"]]
  },
  "resolution-closure": {
    title:"Resolve and close ticket",
    description:"Validate the outcome before closure.",
    code:"FLOW-CLOSE",
    summary:[["Ticket","ST-10482"],["Current state","In Progress"],["Client validation","Required"],["Reopen window","5 business days"]],
    sections:[
      ["Resolution proposal",[["Resolution code","Configuration corrected"],["Public resolution summary","Signing-key configuration corrected and payment callbacks verified."],["Validation evidence","12 successful payment callbacks"],["Remaining risk","Monitor for 24 hours"]]],
      ["Closure controls",[["Client decision","Accepted by Maya Chen"],["SLA outcome","Response met · Restoration met · Resolution met"],["Approved effort","3.0 h posted to contract ledger"],["Retention","Timeline, audit, SLA, and worklogs retained"]]]
    ],
    checklist:["Public resolution sent","Client validation recorded","Required worklogs approved","Open child tasks resolved","Final notifications authorized"],
    actions:[["Confirm closure","PROV-04"],["Return to ticket","PROV-04"]]
  },
  "duplicate-merge": {
    title:"Review possible duplicate tickets",
    description:"Link or merge without losing evidence.",
    code:"FLOW-DUPLICATE",
    summary:[["Current ticket","ST-10482"],["Candidates","2"],["Highest match","92%"],["Client scope","Northstar Retail only"]],
    table:{headers:["Candidate","Similarity","Reason","Owner","State"],rows:[["ST-10481","92%","Same payment reference and callback error","Mahmoud Nader","In Progress"],["ST-10460","71%","Same application and release","Payment Support","Resolved"]]},
    sections:[["Merge decision",[["Primary ticket","ST-10482"],["Selected action","Merge ST-10481 into primary"],["Move records","Public replies, attachments, links, and worklogs"],["Client notification","Explain merged reference only"]]], ["Audit result",[["Secondary ticket","Closed as Duplicate"],["Cross-reference","Retained in both timelines"],["Permissions","Same client and authorized scope confirmed"],["Reason","Same production incident and transaction evidence"]]]],
    actions:[["Confirm merge","PROV-04"],["Keep separate","PROV-04"]]
  },
  "sla-multi-clock": {
    title:"Multi-target SLA timeline",
    description:"Track every contractual clock separately.",
    code:"FLOW-SLA",
    summary:[["First response","Met · 18 min"],["Service restoration","1 h 42 m left"],["Permanent resolution","3 h 12 m left"],["Clock state","Running"]],
    table:{headers:["Time","Event","Response clock","Restoration clock","Resolution clock"],rows:[["09:42","Ticket accepted","Started","Started","Started"],["10:00","First public response","Met","Running","Running"],["11:10","Waiting for client","Complete","Paused","Paused"],["11:58","Client replied","Complete","Resumed · +48m","Resumed · +48m"]]},
    sections:[["Policy snapshot",[["Policy","Premium High v2"],["Calendar","24 × 7 · Asia/Bahrain"],["Pause rule","Verified client input only"],["Warning thresholds","80% for each active target"]]], ["Escalation ownership",[["Restoration warning","Payment Support lead"],["Resolution warning","Duty Manager"],["Breach evidence","Event time and target snapshot retained"],["Client visibility","Due times and outcomes only"]]]],
    actions:[["Open SLA risk queue","SLA-04"],["Return to ticket","PROV-04"]]
  },
  "contract-model": {
    title:"Configure contract entitlement model",
    description:"Define hours, scope, and service limits.",
    code:"FLOW-CONTRACT",
    summary:[["Client","Northstar Retail"],["Contract","CON-2026-018"],["Model","Purchased hours"],["Version","v3 Draft"]],
    sections:[["Entitlement model",[["Contract model","Purchased hours or Annual unlimited"],["Purchased-hours allowance","40 h · only for purchased-hours model"],["Unlimited period","Annual · does not expand service scope"],["Low-balance alert","12 h · purchased-hours only"]]], ["Scope and availability",[["Applications","Commerce API; Customer Portal"],["Services","Incident support; Request fulfilment"],["Service hours","24 × 7 for P1; business hours otherwise"],["Exclusions","Enhancements and on-site services"]]], ["Status behavior",[["Active","New tickets evaluated normally"],["Suspended","New entitlement requires exception approval"],["Expired","No new entitlement; existing snapshots retained"],["Historical terms","Approved version saved on ticket acceptance"]]]],
    actions:[["Save contract draft","CONT-02"],["Return to contract","CONT-02"]]
  },
  "hour-finance": {
    title:"Support-hour financial workflow",
    description:"Estimate, fund, allocate, and export approved usage.",
    code:"FLOW-HOURS",
    summary:[["Current balance","31.5 h"],["Pending approval","2.0 h"],["Top-up request","20 h"],["Finance period","October 2026"]],
    table:{headers:["Step","Reference","Hours","Approval","Ledger effect"],rows:[["Effort estimate","EST-10482","4.0 h","Client approved","No posting"],["Top-up","TOP-2026-014","20.0 h","Finance approved","+20.0 h"],["Cross-contract allocation","ALLOC-882","3.0 h","Contract manager review","Pending"],["Finance export","FIN-OCT-26","8.5 h","Approved","Exported"]]},
    sections:[["Allocation control",[["Source contract","CON-2026-018 · 31.5 h"],["Target contract","CON-2026-024 · 12 h"],["Allocation rule","Same client and covered application"],["Effective result","3 h reserved after approval"]]], ["Finance export evidence",[["Format","CSV and PDF summary"],["Included movements","Approved ledger entries only"],["Reconciliation","Balance matched · no unresolved exception"],["Export reference","FIN-OCT-26 · generated 19 Oct"]]]],
    actions:[["Open contract ledger","CONT-04"],["Open approval center","APR-01"]]
  },
  "email-to-ticket": {
    title:"Verified email-to-ticket intake",
    description:"Convert an authenticated support email into a governed ticket.",
    code:"FLOW-EMAIL",
    summary:[["Message","MAIL-2094"],["Sender","maya@northstar.example"],["Identity","Verified contact"],["Result","Draft ticket"]],
    table:{headers:["Step","Evidence","Decision","Result"],rows:[["Receive","Original MIME and headers retained","Security scan passed","Immutable source saved"],["Identify","Verified domain and contact","Northstar Retail matched","Client scope applied"],["Classify","Subject and body parsed","Incident › Payments","P2 suggested"],["Deduplicate","Reference and text compared","No active duplicate","Draft created"]]},
    sections:[["Ticket mapping",[["Requester","Maya Chen"],["Organization","Northstar Retail"],["Application","Commerce API"],["Contract","CON-2026-018 · Covered"]]],["Acceptance controls",[["Attachments","2 scanned · 2 accepted"],["Client-visible content","Clean body and approved attachments"],["Internal evidence","Headers, parser result, and match score"],["Next action","Agent reviews before ticket acceptance"]]]],
    actions:[["Review ticket draft","PROV-03"],["Return to exceptions","INT-02"]]
  },
  "channel-intake": {
    title:"WhatsApp and Slack intake",
    description:"Capture approved channel messages without losing identity or context.",
    code:"FLOW-CHANNEL",
    summary:[["Channel","WhatsApp Business"],["Conversation","WA-88142"],["Contact","Verified"],["State","Ready to create"]],
    table:{headers:["Channel","Identity check","Content captured","Consent","Outcome"],rows:[["WhatsApp","Verified phone + client contact","Message, images, timestamps","Confirmed","Ticket draft"],["Slack Connect","Workspace + member mapping","Thread and permitted files","Workspace policy","Ticket draft"],["Unknown sender","No trusted match","Metadata only","Not available","Quarantine"]]},
    sections:[["Conversation context",[["Client","Northstar Retail"],["Contact","Maya Chen"],["Selected messages","6 of 11"],["Source link","Retained for authorized support users"]]],["Governance",[["Private channel content","Excluded unless explicitly selected"],["Attachments","Scanned before import"],["Duplicate check","Runs before acceptance"],["Reply route","Portal plus originating channel"]]]],
    actions:[["Create ticket draft","PROV-03"],["Return to integrations","INT-01"]]
  },
  "recurring-schedule": {
    title:"Recurring tickets and reminders",
    description:"Schedule governed service work with clear ownership and stop rules.",
    code:"FLOW-SCHEDULE",
    summary:[["Schedule","Monthly health check"],["Next run","01 Nov · 09:00"],["Owner","Platform Support"],["State","Active"]],
    table:{headers:["Automation","Frequency","Creates","Reminder","Stop rule"],rows:[["Monthly health check","Monthly · day 1","Ticket from approved template","24 h before","Contract expiry"],["Certificate renewal","90 days before expiry","Task linked to application","30 and 7 days","Certificate replaced"],["Client follow-up","Every 2 business days","No new ticket","Owner + manager","Client reply"]]},
    sections:[["Schedule definition",[["Timezone","Asia/Bahrain"],["Template","Preventive service review v2"],["Contract check","Required at every run"],["Duplicate window","Skip if matching ticket is open"]]],["Delivery and audit",[["Recipients","Assigned team and client administrator"],["Failure owner","Support Operations"],["Retry policy","3 attempts over 30 minutes"],["Audit","Creator, versions, runs, skips, and failures"]]]],
    actions:[["Open service settings","SET-00"],["View ticket queue","PROV-02"]]
  },
  "notification-delivery": {
    title:"Notification delivery evidence",
    description:"Trace each alert across portal, email, and connected channels.",
    code:"FLOW-NOTIFY",
    summary:[["Notification","NTF-77421"],["Event","Ticket update"],["Recipients","3"],["Delivery","2 delivered · 1 retry"]],
    table:{headers:["Recipient","Channel","Attempt","Provider result","Next action"],rows:[["Maya Chen","Portal","10:00","Read · 10:14","None"],["maya@northstar.example","Email","10:00","Delivered · MSG-8821","None"],["Support manager","Teams","10:00","429 rate limited","Retry 10:05"]]},
    sections:[["Message evidence",[["Template","Ticket public update v4"],["Rendered language","English"],["Sensitive fields","Masked by audience policy"],["Related record","ST-10482"]]],["Failure handling",[["Retry policy","Exponential · maximum 3 attempts"],["Escalation","Permanent failure alerts channel owner"],["Manual resend","Requires reason and access recheck"],["Retention","Payload hash and provider response retained"]]]],
    actions:[["Return to notifications","NOTIF-01"],["Open ticket","PROV-04"]]
  },
  "knowledge-self-service": {
    title:"Knowledge and guided self-service",
    description:"Suggest approved answers before or during ticket creation.",
    code:"FLOW-KNOWLEDGE",
    summary:[["Query","Payment callback pending"],["Approved matches","3"],["Best match","92%"],["Audience","Northstar Retail"]],
    table:{headers:["Article","Match","Applies to","Updated","Action"],rows:[["Verify payment callback status","92%","Commerce API · Production","12 Oct","Open guide"],["Resend a failed callback","84%","Authorized client admins","05 Oct","Open guide"],["Collect evidence for payment incidents","76%","All supported clients","18 Sep","Use checklist"]]},
    sections:[["Guided resolution",[["Suggested check","Confirm order and payment references"],["Safe action","Retry status lookup only"],["Escalation trigger","Payment captured but order remains pending"],["Evidence to attach","Reference, timestamp, environment, screenshot"]]],["Knowledge governance",[["Publication","Service Quality approval required"],["Visibility","Contract, application, and role scoped"],["Feedback","Helpful / not helpful with reason"],["Ticket link","Article and version saved with the ticket"]]]],
    actions:[["Continue to ticket","CLIENT-03"],["Return to ticket","CLIENT-04"]]
  },
  "satisfaction-survey": {
    title:"Customer satisfaction survey",
    description:"Collect feedback after resolution without changing the ticket outcome.",
    code:"FLOW-CSAT",
    summary:[["Ticket","ST-10482"],["Resolution","Accepted"],["Survey window","5 days"],["Response","Not submitted"]],
    sections:[["Your feedback",[["Overall rating","1–5 stars"],["Resolution quality","Solved the reported issue"],["Communication","Clear and timely updates"],["Optional comment","Visible to service quality reviewers"]]],["Follow-up rules",[["Low score","Creates a service review, not a new incident"],["Contact permission","Ask before follow-up"],["Anonymity","Named because this is a B2B support account"],["Reporting","Aggregated by service, team, and period"]]]],
    checklist:["I confirm the issue is resolved","Service Quality may review this response"],
    actions:[["Submit feedback","CLIENT-04"],["Skip for now","CLIENT-01"]]
  }
};

function gapFlowView(screen) {
  const flow = gapFlowDefinitions[state.flowView];
  if (!flow) return "";
  const table = flow.table ? `<article class="panel sketch-card"><div class="panel-header"><h3>${icon('report',22)} Decision evidence</h3><span class="status">Review required</span></div><div class="table-wrap"><table><thead><tr>${flow.table.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${flow.table.rows.map(r=>`<tr>${r.map((c,i)=>`<td>${i===r.length-1?`<span class="status">${esc(c)}</span>`:esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></article>` : "";
  return `<main class="content flow-view">
    <div class="breadcrumbs"><a data-flow-back="1">${esc(screen.screen_name)}</a><span>/</span><span>${esc(flow.title)}</span></div>
    <div class="page-heading"><div><span class="eyebrow">Connected workflow · ${esc(screen.screen_id)}</span><h2>${esc(flow.title)}</h2><p>${esc(flow.description)}</p></div><span class="screen-code">${esc(flow.code)}</span></div>
    <div class="toolbar"><button class="btn-secondary" data-flow-back="1">${icon('arrow',17)} Back</button></div>
    <section class="flow-summary">${flow.summary.map((item,i)=>`<article class="metric-card sketch-card"><div>${icon(["ticket","clock","contract","shield"][i%4],20)}<span>${esc(item[0])}</span></div><strong>${esc(item[1])}</strong></article>`).join('')}</section>
    ${table}
    <section class="flow-section-grid">${flow.sections.map(section=>`<article class="panel sketch-card"><h3>${icon('check',21)} ${esc(section[0])}</h3><div class="flow-facts">${section[1].map(item=>`<div><label>${esc(item[0])}</label><strong>${esc(item[1])}</strong></div>`).join('')}</div></article>`).join('')}</section>
    ${flow.checklist?`<article class="panel sketch-card"><h3>${icon('shield',21)} Closure checklist</h3><div class="flow-checklist">${flow.checklist.map(x=>`<label><input type="checkbox" checked> <span>${esc(x)}</span></label>`).join('')}</div></article>`:""}
    <div class="flow-footer">${flow.actions.map((a,i)=>`<button class="${i===0?'btn-primary':'btn-secondary'}" data-screen="${esc(a[1])}">${icon(i===0?'check':'arrow',17)} ${esc(a[0])}</button>`).join('')}</div>
  </main>`;
}

function fieldControl(field) {
  const [label, type, value, hint] = field;
  const required = /required/i.test(hint || "");
  let control = "";
  if (type === "textarea") control = `<wired-textarea rows="4" placeholder="${esc(value)}"></wired-textarea>`;
  else if (type === "select") control = `<select class="sketch-select"><option>${esc(value)}</option><option>Select another option...</option></select>`;
  else if (type === "multiselect") control = `<div class="choice-box">${split(value).map((x,i)=>`<label><input type="checkbox" ${i<2?'checked':''}> <span>${esc(x)}</span></label>`).join("")}<button class="inline-link" data-toast="Option picker opened">+ Add option</button></div>`;
  else if (type === "toggle") control = `<label class="toggle-row"><input type="checkbox" ${/enabled|yes|annual/i.test(value)?'checked':''}><span class="toggle-track"></span><span>${esc(value)}</span></label>`;
  else if (type === "upload") control = `<button class="upload-zone" data-toast="File picker opened">${icon('plus',22)}<span><strong>${esc(value)}</strong><small>Browse or drag files here</small></span></button>`;
  else if (type === "readonly") control = `<div class="readonly-control">${esc(value)} ${icon('shield',16)}</div>`;
  else if (type === "action") control = `<button class="btn-secondary" data-toast="Connection test started">${icon('check',17)} Test now</button><span class="action-result">${esc(value)}</span>`;
  else control = `<wired-input type="${['email','password','number','date','time'].includes(type)?type:'text'}" value="${esc(value)}" placeholder="${esc(value)}"></wired-input>`;
  return `<div class="form-field ${type==='textarea'||type==='upload'||type==='multiselect'?'wide':''}"><label>${esc(label)}${required?'<span class="required"> *</span>':''}</label>${control}<small>${esc(hint)}</small></div>`;
}

function detailedForm(screen) {
  const spec = formSpec(screen);
  const isTicket = ["CLIENT-03","PROV-03"].includes(screen.screen_id);
  const primaryLabel = state.formMode === 'edit' ? 'Save changes' : isTicket ? 'Submit ticket' : 'Submit request';
  const progress = `<div class="form-progress" aria-label="Form progress"><span class="${state.formStep >= 1?'active':''}">1</span><b>Details</b><i></i><span class="${state.formStep >= 2?'active':''}">2</span><b>Review</b><i></i><span class="${state.formStep >= 3?'active':''}">3</span><b>Complete</b></div>`;
  if (state.formStep === 3) return `<div class="form-shell">${progress}<section class="form-complete sketch-card"><div class="complete-icon">${icon('check',38)}</div><span class="eyebrow">Submission complete</span><h3>${isTicket?'Ticket created successfully':'Request submitted successfully'}</h3><p>${isTicket?'Reference ST-10491 has been created and routed to Application Support.':'The request was recorded and sent to the authorized reviewer.'}</p><div class="complete-facts"><div><label>Reference</label><strong>${isTicket?'ST-10491':'REQ-2084'}</strong></div><div><label>Status</label><strong>${isTicket?'New · awaiting triage':'Pending review'}</strong></div><div><label>Notification</label><strong>Requester notified</strong></div></div><div class="form-footer"><button class="btn-secondary" data-action="finish-form">${icon('arrow',17)} Return to ${isTicket?'tickets':'screen'}</button>${isTicket?`<button class="btn-primary" data-screen="${state.panel==='CLIENT'?'CLIENT-04':'PROV-04'}">${icon('ticket',17)} View ticket</button>`:''}</div></section></div>`;
  if (state.formStep === 2) {
    const summary = spec.sections.flatMap(section => section[1].slice(0,2).map(field => [field[0],field[2]])).slice(0,10);
    return `<div class="form-shell">${progress}<section class="form-review-grid"><article class="form-section sketch-card"><div class="form-section-head"><div><span class="step-number">02</span><h3>Review submission</h3></div><span>Confirm before submission</span></div><div class="review-summary">${summary.map(item=>`<div><label>${esc(item[0])}</label><strong>${esc(item[1])}</strong></div>`).join('')}</div></article><aside class="form-section sketch-card"><div class="form-section-head"><div>${icon('shield',22)}<h3>Validation result</h3></div><span>Ready</span></div><ul class="list"><li>${icon('check',17)}<span>Required information is complete.</span></li><li>${icon('check',17)}<span>Access scope and related records are valid.</span></li><li>${icon('check',17)}<span>${isTicket?'Contract coverage and routing were confirmed.':'Approval route was resolved.'}</span></li><li>${icon('report',17)}<span>An auditable snapshot will be stored.</span></li></ul></aside></section><section class="review-strip"><div>${icon('warning',22)}<span><strong>Final check</strong><br>Submitting creates an auditable record. You can return to details without losing this draft.</span></div><label><input type="checkbox" data-review-confirm> I reviewed the information</label></section><div class="form-footer"><button class="btn-secondary" data-form-back="1">${icon('arrow',17)} Back to details</button><button class="btn-secondary" data-save-draft="1">${icon('report',17)} Save draft</button><button class="btn-primary" data-action="save-form">${icon('check',17)} ${primaryLabel}</button></div></div>`;
  }
  return `<div class="form-shell">
    ${progress}
    <div class="unsaved-indicator" aria-live="polite">${icon('report',16)} <span>Draft not changed</span></div>
    ${spec.sections.map((section, index) => `<section class="form-section sketch-card"><div class="form-section-head"><div><span class="step-number">${String(index+1).padStart(2,'0')}</span><h3>${esc(section[0])}</h3></div><span>${index===0?'Required information':'Supporting information'}</span></div><div class="form-grid">${section[1].map(fieldControl).join("")}</div></section>`).join("")}
    <section class="review-strip"><div>${icon('warning',22)}<span><strong>Before review</strong><br>Required fields, access scope, and related records will be validated.</span></div></section>
    <div class="form-footer"><button class="btn-secondary" data-action="cancel-form">Cancel</button><button class="btn-secondary" data-save-draft="1">${icon('report',17)} Save draft</button><button class="btn-primary" data-form-next="1">${icon('arrow',17)} Continue to review</button></div>
  </div>`;
}

function actionButtons(screen) {
  if (screen.screen_id === "ADMIN-01") return `<button class="btn-primary" data-screen="SET-00">${icon('settings',17)} Open system settings</button><button class="btn-secondary" data-screen="ORG-01">${icon('people',17)} Manage organizations</button><button class="btn-secondary" data-screen="IAM-06">${icon('user',17)} Manage users</button><button class="btn-secondary" data-screen="AUD-01">${icon('report',17)} Review audit log</button>`;
  const actions = split(screen.primary_actions);
  const standardActions = actions.map((a,i) => {
    const clientHoursTarget = screen.screen_id === "CLIENT-07" && /open hours statement/i.test(a) ? "CLIENT-05" : screen.screen_id === "CLIENT-07" && /open dispute/i.test(a) ? "CLIENT-06" : screen.screen_id === "CLIENT-07" && /create ticket/i.test(a) ? "CLIENT-03" : screen.screen_id === "CLIENT-05" && /open ticket/i.test(a) ? "CLIENT-04" : screen.screen_id === "CLIENT-05" && /start dispute/i.test(a) ? "CLIENT-06" : "";
    const notificationTarget = screen.screen_id === "NOTIF-01" && /^open$/i.test(a) ? (state.panel === "CLIENT" ? "CLIENT-04" : "PROV-04") : "";
    const ticketTarget = clientHoursTarget || notificationTarget || (/open(?: first)? ticket/i.test(a) ? (screen.screen_id.startsWith("CLIENT") ? "CLIENT-04" : "PROV-04") : "");
    const formAction = mutationActionPattern.test(a);
    const mode = /edit|change|correction/i.test(a) ? "edit" : "create";
    return `<button class="${i===0?'btn-primary':'btn-secondary'}" ${ticketTarget ? `data-screen="${ticketTarget}"` : formAction?`data-action="open-form" data-mode="${mode}" data-form-action="${esc(a)}"`:`data-toast="${esc(a)} selected"`}>${icon(ticketTarget?'arrow':formAction?'plus':'arrow',17)} ${esc(sentenceCase(a))}</button>`;
  }).join("");
  if (screen.screen_id !== "PROV-04") return standardActions;
  return `<button class="btn-primary" data-action="open-form" data-mode="edit" data-form-action="Agent edit classification">${icon('settings',17)} Agent edit</button><button class="btn-secondary" data-action="open-form" data-mode="edit" data-form-action="Manager review and override">${icon('people',17)} Manager review</button><button class="btn-secondary" data-flow="resolution-closure">${icon('check',17)} Resolve and close</button><button class="btn-secondary" data-flow="duplicate-merge">${icon('search',17)} Check duplicates</button>${standardActions}`;
}

function workflowEntries() {
  return state.screens.flatMap(screen => split(screen.primary_actions)
    .filter(action => mutationActionPattern.test(action))
    .map(action => ({ screen, action, mode: /edit|change|correction|correct|restrict|set scope/i.test(action) ? "edit" : "create" })));
}
function workflowCode(screenId, action, mode) {
  const slug = action.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 22);
  return `${screenId}-${mode === "edit" ? "EDIT" : "ACTION"}-${slug}`;
}
function screenDirectoryView() {
  const workflows = workflowEntries();
  const modules = [...new Set(state.screens.map(s => s.module))].sort();
  return `<main class="content directory-view">
    <div class="breadcrumbs"><a data-home="1">Prototype</a><span>/</span><span>Screen directory</span></div>
    <div class="page-heading"><div><span class="eyebrow">Complete wireframe coverage</span><h2>Screen directory</h2><p>Open any screen or workflow.</p></div><span class="screen-code">${state.screens.length} BASE · ${workflows.length} ACTION</span></div>
    <section class="grid kpis directory-kpis"><article class="kpi sketch-card"><div class="kpi-top"><span>Catalog screens</span>${icon('report',22)}</div><strong>${state.screens.length}</strong><small>Every English CSV record</small></article><article class="kpi sketch-card"><div class="kpi-top"><span>Action screens</span>${icon('settings',22)}</div><strong>${workflows.length}</strong><small>Generated create/edit workflows</small></article><article class="kpi sketch-card"><div class="kpi-top"><span>Navigation panels</span>${icon('dashboard',22)}</div><strong>3</strong><small>Client, Support, Admin</small></article><article class="kpi sketch-card"><div class="kpi-top"><span>Missing screens</span>${icon('check',22)}</div><strong>0</strong><small>Coverage audit result</small></article></section>
    <div class="directory-toolbar sketch-card"><wired-search-input placeholder="Use browser find to locate a screen or action"></wired-search-input><span>${icon('search',18)} Search by screen name, ID, module, or action</span></div>
    ${modules.map(module => { const screens=state.screens.filter(s=>s.module===module); return `<section class="directory-module sketch-card"><div class="directory-module-head"><h3>${icon(iconFor(module),22)} ${esc(module)}</h3><span>${screens.length} base screens</span></div>${screens.map(screen=>{const acts=workflows.filter(w=>w.screen.screen_id===screen.screen_id);return `<div class="directory-screen"><button class="directory-base" data-screen="${screen.screen_id}"><span><b>${esc(screen.screen_id)}</b>${esc(screen.screen_name)}</span><small>Open base screen</small></button>${acts.length?`<div class="directory-actions">${acts.map(w=>`<button data-directory-action="1" data-directory-screen="${screen.screen_id}" data-mode="${w.mode}" data-form-action="${esc(w.action)}"><span>${esc(w.action)}</span><small>${workflowCode(screen.screen_id,w.action,w.mode)}</small></button>`).join("")}</div>`:`<div class="directory-no-actions">No create or edit workflow required for this screen.</div>`}</div>`}).join("")}</section>`}).join("")}
  </main>`;
}

function screenView(screen) {
  if (state.flowView) return gapFlowView(screen);
  const components = split(screen.main_components).slice(0, 12);
  const states = split(screen.states_and_scenarios).slice(0, 7);
  const kpis = sampleKPIs(screen);
  const isForm = formFirstScreens.has(screen.screen_id) || Boolean(state.formMode);
  const specializedContent = !isForm ? specializedScreenContent(screen) : "";
  const activeTitle = isForm ? formSpec(screen).title : screen.screen_name;
  return `<main class="content">
    <div class="breadcrumbs"><a data-home="1">${state.panel[0]+state.panel.slice(1).toLowerCase()}</a><span>/</span><span>${esc(screen.module)}</span><span>/</span><span>${esc(activeTitle)}</span></div>
    <div class="page-heading"><div><span class="eyebrow">${esc(screen.channel)} · ${esc(screen.primary_roles)}</span><h2>${esc(activeTitle)}</h2><p>${esc(conciseDescription(screen))}</p></div><span class="screen-code">${esc(screen.screen_id)} · ${esc(screen.wireframe_priority)}</span></div>
    ${isForm && !formFirstScreens.has(screen.screen_id) ? `<div class="toolbar"><button class="btn-secondary" data-action="cancel-form">${icon('arrow',17)} Back to list</button></div>` : !isForm && !["SET-00","OPS-00","IAM-01","IAM-02"].includes(screen.screen_id) ? `<div class="toolbar">${actionButtons(screen)}</div>` : ""}
    ${states.some(s => /risk|warning|breach|error|fail|expired|rejected/i.test(s)) ? `<div class="callout">${icon('warning',23)}<div><strong>Scenario preview</strong><br><span>Example state: ${esc(states.filter(s => /risk|warning|breach|error|fail|expired|rejected/i.test(s)).slice(0,3).join(" · "))}</span></div></div>` : ""}
    ${isForm ? detailedForm(screen) : screen.screen_id === "SET-00" ? systemSettingsContent() : screen.screen_id === "OPS-00" ? operationsOverviewContent() : screen.screen_id === "IAM-01" ? roleCatalogContent() : screen.screen_id === "IAM-02" ? permissionMatrixContent() : specializedContent ? specializedContent : ["CLIENT-04","PROV-04"].includes(screen.screen_id) ? ticketDetailContent(screen) : screen.screen_id === "NOTIF-01" ? notificationCenterContent() : ["CLIENT-05","CLIENT-06","CLIENT-07"].includes(screen.screen_id) ? clientContractsContent(screen) : `${kpis.length ? `<section class="grid kpis">${kpis.map((k,i) => `<article class="kpi sketch-card"><div class="kpi-top"><span>${esc(k[0])}</span>${icon(["ticket","clock","contract","bell"][i],22)}</div><strong>${esc(k[1])}</strong><small>${esc(k[2])}</small></article>`).join("")}</section>` : ""}
    <section class="grid">
      <article class="panel sketch-card">
        <div class="panel-header"><h3>${icon('ticket',23)} Current records</h3><span class="status">Prototype data</span></div>
        <div class="filter-row"><wired-search-input placeholder="Search within this view"></wired-search-input><select class="sketch-select" aria-label="Status"><option>All statuses</option><option>Needs attention</option></select><select class="sketch-select" aria-label="Date range"><option>Last 30 days</option><option>Last 7 days</option></select></div>${tableFor(screen)}
      </article>
    </section>`}
  </main>`;
}

function render() {
  const screen = state.screens.find(s => s.screen_id === state.screenId) || state.screens[0];
  document.querySelector("#app").innerHTML = ["AUTH-01","AUTH-02"].includes(screen.screen_id) ? authView(screen) : `<div class="shell">${sidebar()}<section class="workspace"><header class="topbar"><button class="icon-button menu-toggle" data-menu="1">${icon('menu',22)}</button><div class="global-search"><wired-search-input placeholder="Search tickets, clients, contracts..."></wired-search-input></div><div class="top-actions"><button class="icon-button" data-directory="1" aria-label="Screen directory">${icon('report',21)}</button><button class="icon-button" data-screen="NOTIF-01" aria-label="Notifications">${icon('bell',21)}</button><button class="user-chip" data-screen="PROFILE-01">${icon('user',21)}<span>Mahmoud Nader</span></button></div></header>${state.directory?screenDirectoryView():screenView(screen)}</section></div>`;
  bind();
}

function panelDefault(panel) { return ({CLIENT:"CLIENT-01",SUPPORT:"PROV-01",ADMIN:"ADMIN-01"})[panel]; }
function clearFormState() { state.formMode = null; state.formAction = ""; state.formStep = 1; state.formDirty = false; }
function leaveForm(next) {
  if (state.formDirty && !window.confirm("You have unsaved changes. Leave this form and discard them?")) return;
  clearFormState(); next();
}
function applyPermissionFilters() {
  const query = (document.querySelector('[data-permission-search]')?.value || '').trim().toLowerCase();
  const panel = document.querySelector('[data-permission-panel]')?.value || 'All panels';
  const module = document.querySelector('[data-permission-module-filter]')?.value || 'All modules';
  const decision = document.querySelector('[data-permission-decision]')?.value || 'All decisions';
  const changedOnly = Boolean(document.querySelector('[data-permission-changed]')?.checked);
  const filtered = query || !panel.startsWith('All ') || !module.startsWith('All ') || !decision.startsWith('All ') || changedOnly;
  document.querySelectorAll('.permission-screen-row').forEach(row => {
    const matches = (!query || row.textContent.toLowerCase().includes(query)) && (panel.startsWith('All ') || row.dataset.panels.includes(panel)) && (module.startsWith('All ') || row.dataset.module === module) && (decision.startsWith('All ') || row.textContent.includes(decision)) && (!changedOnly || row.dataset.changed === 'true');
    row.hidden = !matches || (!filtered && !state.permissionOpenModules.includes(row.dataset.module));
  });
  document.querySelectorAll('.permission-module-row').forEach(group => {
    const moduleRows = [...document.querySelectorAll(`.permission-screen-row[data-module="${CSS.escape(group.dataset.permissionGroup)}"]`)];
    const hasVisibleRows = moduleRows.some(row => !row.hidden);
    group.hidden = filtered && !hasVisibleRows;
    const toggle = group.querySelector('[data-permission-module]');
    if (toggle) toggle.setAttribute('aria-expanded', String(hasVisibleRows));
  });
  toast(filtered ? 'Permission filters applied' : 'Permission filters cleared');
}
function bind() {
  document.querySelectorAll("[data-panel]").forEach(el => el.onclick = () => leaveForm(() => { state.panel = el.dataset.panel; state.screenId = panelDefault(state.panel); state.sidebarOpen = false; state.directory = false; state.flowView = null; render(); }));
  document.querySelectorAll("[data-login-panel]").forEach(el => el.onclick = () => { state.panel = el.dataset.loginPanel; state.screenId = panelDefault(state.panel); state.sidebarOpen = false; state.formMode = null; state.formAction = ""; state.directory = false; state.flowView = null; render(); window.scrollTo(0,0); });
  document.querySelectorAll("[data-screen]").forEach(el => el.onclick = () => { if (!el.dataset.screen) return; leaveForm(() => { state.screenId = el.dataset.screen; const match = navGroups(state.panel).find(g => g.rows.some(r => r.target_screen_id === state.screenId)); if (match) state.panelNavGroup[state.panel] = match.name; state.sidebarOpen = false; state.directory = false; state.flowView = null; render(); window.scrollTo(0,0); }); });
  document.querySelectorAll("[data-nav-group]").forEach(el => el.onclick = () => { state.panelNavGroup[state.panel] = el.dataset.navGroup; render(); });
  document.querySelectorAll("[data-directory]").forEach(el => el.onclick = () => leaveForm(() => { state.directory = true; state.sidebarOpen = false; state.flowView = null; render(); window.scrollTo(0,0); }));
  document.querySelectorAll("[data-directory-action]").forEach(el => el.onclick = () => { state.screenId = el.dataset.directoryScreen; state.formMode = el.dataset.mode; state.formAction = el.dataset.formAction; state.formStep = 1; state.formDirty = false; state.directory = false; state.flowView = null; render(); window.scrollTo(0,0); });
  document.querySelectorAll("[data-home]").forEach(el => el.onclick = () => leaveForm(() => { state.screenId = panelDefault(state.panel); render(); }));
  document.querySelectorAll("[data-menu]").forEach(el => el.onclick = () => { state.sidebarOpen = !state.sidebarOpen; render(); });
  document.querySelectorAll("[data-toast]").forEach(el => el.onclick = () => toast(el.dataset.toast));
  document.querySelectorAll("[data-flow]").forEach(el => el.onclick = () => { state.flowView = el.dataset.flow; state.formMode = null; state.formAction = ""; state.directory = false; render(); window.scrollTo(0,0); });
  document.querySelectorAll("[data-flow-back]").forEach(el => el.onclick = () => { state.flowView = null; render(); window.scrollTo(0,0); });
  document.querySelectorAll('[data-action="open-form"]').forEach(el => el.onclick = () => { state.formMode = el.dataset.mode || 'create'; state.formAction = el.dataset.formAction || (state.formMode === 'edit' ? 'Edit selected record' : 'Create new record'); state.formStep = 1; state.formDirty = false; render(); window.scrollTo(0,0); });
  document.querySelectorAll('[data-action="cancel-form"]').forEach(el => el.onclick = () => leaveForm(() => { if (["CLIENT-03","PROV-03"].includes(state.screenId)) state.screenId = state.panel === 'CLIENT' ? 'CLIENT-02' : 'PROV-02'; render(); window.scrollTo(0,0); }));
  document.querySelectorAll('[data-form-next]').forEach(el => el.onclick = () => { state.formStep = 2; render(); window.scrollTo(0,0); });
  document.querySelectorAll('[data-form-back]').forEach(el => el.onclick = () => { state.formStep = 1; render(); window.scrollTo(0,0); });
  document.querySelectorAll('[data-save-draft]').forEach(el => el.onclick = () => { state.formDirty = false; const label=document.querySelector('.unsaved-indicator span'); if(label) label.textContent='Draft saved just now'; toast('Draft saved'); });
  document.querySelectorAll('[data-action="save-form"]').forEach(el => el.onclick = () => { const confirmation=document.querySelector('[data-review-confirm]'); if (confirmation && !confirmation.checked) { toast('Confirm that you reviewed the information'); confirmation.focus(); return; } state.formDirty = false; state.formStep = 3; render(); window.scrollTo(0,0); });
  document.querySelectorAll('[data-action="finish-form"]').forEach(el => el.onclick = () => { const target=["CLIENT-03","PROV-03"].includes(state.screenId)?(state.panel==='CLIENT'?'CLIENT-02':'PROV-02'):state.screenId; clearFormState(); state.screenId=target; render(); window.scrollTo(0,0); });
  document.querySelectorAll('[data-permission-module]').forEach(el => el.onclick = () => { const module=el.dataset.permissionModule; state.permissionOpenModules = state.permissionOpenModules.includes(module) ? [] : [module]; render(); });
  document.querySelectorAll('[data-permission-apply]').forEach(el => el.onclick = applyPermissionFilters);
  document.querySelectorAll('.form-shell input, .form-shell select, .form-shell wired-input, .form-shell wired-textarea').forEach(el => { const markDirty=()=>{ state.formDirty=true; const label=document.querySelector('.unsaved-indicator span'); if(label) label.textContent='Unsaved changes'; }; el.addEventListener('input',markDirty); el.addEventListener('change',markDirty); });
}
function toast(message) { const old=document.querySelector('.toast'); if(old) old.remove(); const el=document.createElement('div'); el.className='toast'; el.textContent=message; document.body.appendChild(el); setTimeout(()=>el.remove(),1800); }

loadData().catch(error => {
  document.querySelector("#loading").innerHTML = `<h1>Wireframe data could not load</h1><p>${esc(error.message)}</p><p>Run this folder through a local web server so the CSV files can be read.</p>`;
});
