import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = new HttpLink({
  uri: "/v1/graphql",
});

const ws = window.location.protocol === "https:" ? "wss:" : "ws:";
const url = new URL(`${ws}//${window.location.host}/v1/graphql`);

const wsLink = new WebSocketLink({
  uri: url.href,
  options: {
    reconnect: true,
  },
});

// Use the httpLink for queries and wsLink for subscriptions
const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink!,
  httpLink
);

const APOLLO_CLIENT = new ApolloClient({
  link: link,
  cache: new InMemoryCache({
    typePolicies: {
      Agent: {
        keyFields: ["id"],
      },
      Configuration: {
        keyFields: ["metadata"],
      },
      SourceType: {
        keyFields: ["metadata"],
      },
      DestinationType: {
        keyFields: ["metadata"],
      },
      Metadata: {
        keyFields: ["name"],
      },
    },
  }),
});

export default APOLLO_CLIENT;
