// Next.js llama a register una vez al iniciar cada servidor (next dev y next start)
export async function register() {
  // Los jobs usan pg y croner, que solo funcionan en el runtime de Node.js
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { programarNotificacionSuper } = await import("./app/job/notificacion-super.job");
    programarNotificacionSuper();
  }
}
