const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar.",
  user_already_exists: "Já existe uma conta com este e-mail.",
  email_exists: "Já existe uma conta com este e-mail.",
  weak_password: "A senha não atende aos requisitos de segurança.",
  signup_disabled: "Novos cadastros estão temporariamente indisponíveis.",
  over_email_send_rate_limit:
    "Muitas tentativas foram realizadas. Aguarde alguns minutos.",
  over_request_rate_limit:
    "Muitas tentativas foram realizadas. Aguarde alguns minutos.",
};

type ErrorLike = {
  code?: unknown;
  message?: unknown;
};

function isErrorLike(value: unknown): value is ErrorLike {
  return typeof value === "object" && value !== null;
}

export function getAuthErrorMessage(error: unknown) {
  if (!isErrorLike(error)) {
    return "Não foi possível concluir a solicitação. Tente novamente.";
  }

  if (typeof error.code === "string" && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  const normalizedMessage =
    typeof error.message === "string" ? error.message.toLowerCase() : "";

  if (normalizedMessage.includes("invalid login credentials")) {
    return ERROR_MESSAGES.invalid_credentials;
  }

  if (normalizedMessage.includes("already registered")) {
    return ERROR_MESSAGES.user_already_exists;
  }

  return "Não foi possível concluir a solicitação. Tente novamente.";
}
