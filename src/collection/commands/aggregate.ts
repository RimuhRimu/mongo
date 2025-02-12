import { Document } from "../../../deps.ts";
import { CommandCursor } from "../../protocol/cursor.ts";
import { WireProtocol } from "../../protocol/protocol.ts";
import { AggregateOptions } from "../../types.ts";

interface AggregateCursorContext {
  dbName: string;
  collectionName: string;
  protocol: WireProtocol;
  pipeline: Document;
  options?: AggregateOptions;
}

export class AggregateCursor<T> extends CommandCursor<T> {
  #context: AggregateCursorContext;

  private async executor() {
    const { dbName, pipeline, collectionName, protocol, options } =
      this.#context;

    const { cursor } = await protocol.commandSingle(dbName, {
      aggregate: collectionName,
      pipeline,
      cursor: {
        batchSize: options?.batchSize || 1000,
      },
      ...options,
    });
    return {
      ...cursor,
      id: cursor.id.toString(),
    };
  }

  constructor(context: AggregateCursorContext) {
    super(context.protocol, () => this.executor());
    this.#context = context;
  }
}
