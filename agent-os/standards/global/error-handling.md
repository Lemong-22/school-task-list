## Error Handling Best Practices

- **Mandatory Loading and Error States**: Every asynchronous operation (e.g., an API call) MUST manage and expose states for `loading`, `error`, and `data`. The UI must display appropriate feedback to the user for each of these states (e.g., a loading spinner, an error message).
- **User-Friendly Messages**: Provide clear, actionable error messages to users without exposing technical details or security information.
- **Fail Fast and Explicitly**: Validate input and check preconditions early; fail with clear error messages rather than allowing invalid state.
- **Specific Exception Types**: Use specific exception/error types rather than generic ones to enable targeted handling.
- **Centralized Error Handling**: Handle errors at appropriate boundaries (controllers, API layers) rather than scattering try-catch blocks everywhere.
- **Graceful Degradation**: Design systems to degrade gracefully when non-critical services fail rather than breaking entirely.
- **Retry Strategies**: Implement exponential backoff for transient failures in external service calls.
- **Clean Up Resources**: Always clean up resources (file handles, connections) in finally blocks or equivalent mechanisms.