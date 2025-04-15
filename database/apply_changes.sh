#!/bin/bash

# Definir variáveis
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_HOST=${DB_HOST}

# Verificar se as variáveis estão definidas
if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ] || [ -z "$DB_HOST" ]; then
  echo "Erro: Variáveis de ambiente do banco de dados não definidas."
  echo "Por favor, defina DB_USER, DB_PASSWORD, DB_NAME e DB_HOST."
  exit 1
fi

# Aplicar o esquema
echo "Aplicando alterações no esquema do banco de dados..."
mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST $DB_NAME < schema.sql

# Verificar se o comando anterior foi bem-sucedido
if [ $? -eq 0 ]; then
  echo "Esquema aplicado com sucesso."
else
  echo "Erro ao aplicar o esquema."
  exit 1
fi

# Gerar hash da senha para o administrador
ADMIN_PASSWORD_HASH=$(php -r "echo password_hash('ingline', PASSWORD_BCRYPT);")

# Substituir o placeholder pelo hash real
sed -i "s/\$2a\$10\$YourHashedPasswordHere/$ADMIN_PASSWORD_HASH/g" create_admin.sql

# Criar o usuário administrador
echo "Criando usuário administrador..."
mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST $DB_NAME < create_admin.sql

# Verificar se o comando anterior foi bem-sucedido
if [ $? -eq 0 ]; then
  echo "Usuário administrador criado com sucesso."
else
  echo "Erro ao criar o usuário administrador."
  exit 1
fi

echo "Todas as alterações foram aplicadas com sucesso!"
