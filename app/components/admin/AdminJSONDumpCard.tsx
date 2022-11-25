import { Card, Text } from "@nextui-org/react";

type AdminJSONDumpCardProps<T> = {
  entity: T;
};

export function AdminJSONDumpCard<T>({ entity }: AdminJSONDumpCardProps<T>) {
  return (
    <>
      <h3>JSON Dump</h3>
      <Card>
        <Card.Body>
          <Text
            css={{
              fontFamily: "$mono",
              whiteSpace: "pre-wrap",
              maxWidth: "400px",
              wordBreak: "break-all",
            }}
            size="small"
          >
            {JSON.stringify(entity, null, 2)}
          </Text>
        </Card.Body>
      </Card>
    </>
  );
}
