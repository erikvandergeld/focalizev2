-- Criar o usuário administrador
INSERT INTO `users` (
  `username`, 
  `email`, 
  `password`, 
  `full_name`, 
  `role`, 
  `is_active`
) 
VALUES (
  'erick', 
  'erick@grupolinesolucoes.com.br', 
  -- A senha 'ingline' com hash (usando bcrypt ou o método de hash que seu sistema utiliza)
  -- Este é um placeholder, você deve substituir pelo hash real gerado pelo seu sistema
  '$2a$10$YourHashedPasswordHere', 
  'Erick Administrador', 
  'admin', 
  TRUE
)
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `role` = 'admin',
  `is_active` = TRUE;
