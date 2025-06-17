#!/bin/bash

echo "[entrypoint] Valor de MODE = '$MODE'"

if [ "$MODE" = "test" ]; then
  echo "[entrypoint] MODE=test → iniciando nginx"
  service nginx start
  service nginx status || echo "[entrypoint] ⚠️ nginx failed to start!"
else
  echo "[entrypoint] MODE=$MODE → não iniciando nginx"
  service nginx status || echo "[entrypoint] nginx não está rodando"
fi

exec "$@"
echo "[entrypoint] Executando o comando: $@"