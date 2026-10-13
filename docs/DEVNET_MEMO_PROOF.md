# Arkhe Devnet Memo proof v1

The hackathon MVP registers a file proof through the official Solana Memo program on **Devnet**. It does not use the repository's Anchor program because that program is configured only for Localnet and is not verified as deployed on Devnet.

## Proof payload

The Memo instruction contains UTF-8 JSON with this exact shape:

```json
{
  "version": "arkhe-proof/v1",
  "hashAlgorithm": "BLAKE3",
  "fileHash": "64 lowercase hexadecimal characters",
  "wallet": "the connected wallet base58 address"
}
```

`fileHash` is the BLAKE3-256 digest of the selected file bytes, calculated locally in the browser. The file is not uploaded by this flow.

## Registration checks

Before signing, the browser checks that the configured RPC has the Solana Devnet genesis hash:

`EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG`

The wallet must explicitly sign and submit the transaction. Arkhe waits for a confirmed result and then independently re-reads the transaction before presenting its signature.

## Verification checks

Verification requires a selected file and a transaction signature. The browser:

1. recalculates the selected file's BLAKE3 digest;
2. checks the signature status is `confirmed` or `finalized` on Devnet and that the transaction did not fail;
3. finds an instruction for the official Memo program;
4. decodes and validates the Arkhe proof version and BLAKE3 digest; and
5. confirms the proof wallet matches the transaction fee payer and that the file digest matches.

This proves only the presence of this Memo payload in a confirmed **Devnet** transaction. It does not prove copyright, authorship, C2PA validity, a legal claim, a Neon record, or royalty settlement.
