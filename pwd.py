import bcrypt

password = b"qwerty123!"
salt = bcrypt.gensalt(rounds=10)
hashed = bcrypt.hashpw(password, 
salt)

print(hashed.decode())

