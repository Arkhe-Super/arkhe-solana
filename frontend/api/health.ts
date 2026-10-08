type ApiResponse = {
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

export default function handler(
  _req: unknown,
  res: ApiResponse
) {
  res.status(200).json({
    status: "ok",
    service: "arkhe-api",
  });
}