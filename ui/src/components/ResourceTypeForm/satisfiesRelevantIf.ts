import { isEqual } from "lodash";
import { ParameterDefinition } from "../../graphql/generated";

export function satisfiesRelevantIf(
  formValues: { [name: string]: any },
  definition: ParameterDefinition
): boolean {
  if (definition.relevantIf == null) {
    return true;
  }

  const relaventIf = definition.relevantIf;

  for (const condition of relaventIf) {
    // TODO (dsvanlani) Right now we only support and expect the "equals" operator
    // Add a capability to satisfy other operators like "less than" or "greater than".
    if (!isEqual(formValues[condition.name], condition.value)) {
      return false;
    }
  }

  return true;
}
