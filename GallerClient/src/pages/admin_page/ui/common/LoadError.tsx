import { Alert, Button } from "@mui/joy";

type LoadErrorProps = {
  message: string;
  onRetry: () => void;
};

export const LoadError = ({ message, onRetry }: LoadErrorProps) => (
  <Alert
    color="danger"
    endDecorator={(
      <Button color="danger" size="sm" variant="soft" onClick={onRetry}>
        Повторить
      </Button>
    )}
  >
    {message}
  </Alert>
);
