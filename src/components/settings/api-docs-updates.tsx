"use client";

const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://builders.to";

export function ApiDocsUpdates() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Use your API key to authenticate. Send it in the <code className="rounded bg-zinc-800 px-1 text-xs">Authorization: Bearer YOUR_KEY</code> header
        or <code className="rounded bg-zinc-800 px-1 text-xs">X-API-Key: YOUR_KEY</code>.
      </p>

      <div className="rounded-lg border border-white/10 bg-zinc-900/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-zinc-900">
              <th className="px-4 py-3 text-left font-medium text-zinc-300">Method</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-300">Endpoint</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-300">Description</th>
            </tr>
          </thead>
          <tbody className="text-zinc-400">
            <tr className="border-b border-white/5">
              <td className="px-4 py-2 font-mono text-green-400">GET</td>
              <td className="px-4 py-2 font-mono text-xs">{baseUrl}/api/updates</td>
              <td className="px-4 py-2">List updates (optional <code className="text-zinc-500">?userId=</code> for one user)</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="px-4 py-2 font-mono text-green-400">GET</td>
              <td className="px-4 py-2 font-mono text-xs">{baseUrl}/api/updates/[id]</td>
              <td className="px-4 py-2">Get a single update by ID</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="px-4 py-2 font-mono text-amber-400">POST</td>
              <td className="px-4 py-2 font-mono text-xs">{baseUrl}/api/updates</td>
              <td className="px-4 py-2">Create an update (body: <code className="text-zinc-500">content</code>, optional <code className="text-zinc-500">imageUrl</code>, <code className="text-zinc-500">gifUrl</code>)</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="px-4 py-2 font-mono text-blue-400">PATCH</td>
              <td className="px-4 py-2 font-mono text-xs">{baseUrl}/api/updates/[id]</td>
              <td className="px-4 py-2">Edit an update (body: <code className="text-zinc-500">content</code>, <code className="text-zinc-500">imageUrl</code>, <code className="text-zinc-500">gifUrl</code>)</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="px-4 py-2 font-mono text-red-400">DELETE</td>
              <td className="px-4 py-2 font-mono text-xs">{baseUrl}/api/updates/[id]</td>
              <td className="px-4 py-2">Delete an update (owner only)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-500">
        POST and PATCH require authentication (session or API key). Same daily limits apply (3/day free, 20/day Pro).
      </p>
    </div>
  );
}
