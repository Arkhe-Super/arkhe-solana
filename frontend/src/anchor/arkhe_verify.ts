
export type ArkheVerify = {
  version: "0.1.0";
  name: "arkhe_verify";
  instructions: [
    {
      name: "anchorRecord";
      accounts: [
        { name: "work"; isMut: true; isSigner: false },
        { name: "authority"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "recordHash"; type: "bytes" },
        { name: "metadataUri"; type: "string" }
      ];
    },
    {
      name: "verifyInclusion";
      accounts: [
        { name: "work"; isMut: true; isSigner: false },
        { name: "authority"; isMut: false; isSigner: true }
      ];
      args: [
        { name: "recordHash"; type: "bytes" },
        { name: "proof"; type: "bytes" }
      ];
    },
    {
      name: "settleRoyalty";
      accounts: [
        { name: "work"; isMut: true; isSigner: false },
        { name: "payer"; isMut: true; isSigner: true },
        { name: "recipient"; isMut: true; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "amount"; type: "u64" }
      ];
    }
  ];
  accounts: [
    {
      name: "Work";
      type: {
        kind: "struct";
        fields: [
          { name: "authority"; type: "publicKey" },
          { name: "recordHash"; type: "bytes" },
          { name: "metadataUri"; type: "string" },
          { name: "bump"; type: "u8" }
        ];
      };
    }
  ];
};

export const IDL: ArkheVerify = {
  "version": "0.1.0",
  "name": "arkhe_verify",
  "instructions": [
    {
      "name": "anchorRecord",
      "accounts": [
        {
          "name": "work",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "recordHash",
          "type": "bytes"
        },
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "verifyInclusion",
      "accounts": [
        {
          "name": "work",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "recordHash",
          "type": "bytes"
        },
        {
          "name": "proof",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "settleRoyalty",
      "accounts": [
        {
          "name": "work",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "recipient",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Work",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "recordHash",
            "type": "bytes"
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
