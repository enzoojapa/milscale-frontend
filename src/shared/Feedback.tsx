export function Feedback({ erro, sucesso }: { erro?: string | null; sucesso?: string | null }) {
  if (erro) return <div className="alerta erro">{erro}</div>;
  if (sucesso) return <div className="alerta ok">{sucesso}</div>;
  return null;
}
