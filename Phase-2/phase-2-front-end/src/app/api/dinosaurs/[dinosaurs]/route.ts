import { NextRequest } from "next/server";
import data from "../data.json" with { type: "json" };

type RouteParams = { params: { dinosaur: string } };

export const GET = (request: NextRequest, context: RouteParams) => {
  if (!context?.params?.dinosaur) {
    return Response.json("No dinosaur name provided.");
  }

  const dinosaur = data.find((item) =>
    item.name.toLowerCase() === context.params.dinosaur.toLowerCase()
  );

  return Response.json(dinosaur ? dinosaur : "No dinosaur found.");
};
