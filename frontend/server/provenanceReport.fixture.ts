export function validProvenanceReport() {
  return {
    schema_version: '1.1' as const,
    generated_at: '2026-10-11T12:00:00Z',
    target_a: {
      title: 'Work A',
      artist: 'Arkhe',
      year: 2026,
      mbid: '7be9baef-1f19-482a-a035-ff9c7c4f4a38',
      sha256: 'a'.repeat(64),
    },
    target_b: {
      title: 'Work B',
      artist: 'Arkhe',
      year: 2026,
      mbid: 'c36d0b55-8d5f-4663-95aa-2831518f8eb0',
      sha256: 'b'.repeat(64),
    },
    similarity: {
      clap_cosine: null,
      melodic: { status: 'not_checked' },
    },
    manifest: { source: 'hackathon-demo' },
    script_sha256: 'c'.repeat(64),
    content_hash: 'd'.repeat(64),
    trust_policy: 'integrity_only' as const,
    trust_context: {
      verifier: 'arkhe-preflight',
      verifier_version: '23',
      trust_basis: 'bundled_static_material',
    },
  };
}
