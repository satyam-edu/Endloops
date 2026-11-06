// Every product on the site lives here. To add one, add a line and the pages update themselves.

export const availabilityLine =
  "Some of these are in use today and others are in development. Ask us what is ready for your team.";

export const processSteps = ["Read", "Compare", "Check", "Draft", "Sign-off"];

export type Capability = "Read" | "Compare" | "Check" | "Draft";

export const capabilities: Capability[] = ["Read", "Compare", "Check", "Draft"];

export const solutions = [
  {
    name: "Budget review",
    line: "Works through a budget and its supporting documents, and brings what needs attention to your reviewer.",
  },
  {
    name: "Escrow audit",
    line: "Runs the escrow audit from source documents through to a draft ready for the auditor.",
  },
  {
    name: "Financial audit",
    line: "Carries the audit from documents and ledger checks to working papers ready for sign-off.",
  },
  {
    name: "Interim audit",
    line: "Brings the same prepared process to audit work during the period.",
  },
  {
    name: "Budget preparation",
    fullName: "Budget preparation for property management companies",
    line: "For property management companies: turns the inputs into a draft budget ready for review.",
  },
];

export const tools: { name: string; line: string; capabilities: Capability[] }[] = [
  {
    name: "Purchase-order extraction",
    line: "Pulls the figures and details out of purchase orders.",
    capabilities: ["Read"],
  },
  {
    name: "Vouching automation",
    line: "Checks recorded entries against their supporting documents.",
    capabilities: ["Read", "Compare"],
  },
  {
    name: "Expense working automation",
    line: "Builds the expense working from the underlying documents.",
    capabilities: ["Read", "Draft"],
  },
  {
    name: "Financial report review",
    line: "Checks a financial report for missing items and totals that don't agree.",
    capabilities: ["Check"],
  },
  {
    name: "Tender verification",
    line: "Compares quotes against each other and against agreed limits.",
    capabilities: ["Compare", "Check"],
  },
  {
    name: "Reconciliation",
    line: "Matches documents against the ledger and lists what doesn't agree.",
    capabilities: ["Compare", "Check"],
  },
];
