# Fix Audio Attachment (Missing Auth)

## Goal Description
The "Attach Audio" functionality requires `currentUserId` to upload files to Supabase Storage. Currently, this state variable is initialized to `null` and never populated, causing the upload to abort (with a console error).

I will add an effect to fetch the current user session on mount.

## User Review Required
> [!NOTE]
> This requires the user to be logged in (or have a valid supabase session) for uploads to persist. For the demo, general functionality works locally, but the upload step is explicit.

## Proposed Changes

### [MODIFY] [SpatialAudioEditor.tsx](file:///Users/ambrose_/Desktop/exploration/Resonance/resonance/src/components/SpatialAudioEditor.tsx)
-   Add `useEffect` to call `supabase.auth.getUser()`.
-   Set `currentUserId` based on the response.

## Verification Plan

### Manual Verification
1.  **Load App**: Open the editor.
2.  **Attach Audio**: Upload a local file to a source.
3.  **Check Logs**: Verify "File uploaded: ..." or at least that "No user ID found" is not logged.
4.  **Confirm**: The Audio should attach and play.
