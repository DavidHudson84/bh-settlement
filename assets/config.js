/* BH Restoration — settlement board configuration.
   The publishable key is public by design. It grants nothing on its own:
   every table has row level security with no policies, and all access runs
   through passcode-gated security-definer functions. */
window.CFG = {
  API:   "https://fpfedspxtupffntienqr.supabase.co/rest/v1/rpc",
  KEY:   "sb_publishable_WZyr2GxAHTyzAgTSebC9LQ_hTQns7iw",
  BUILD: "2026-09-03.1",
  POLL:  12000
};
