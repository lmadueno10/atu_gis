<?php
// Obtener la cadena de conexión desde las variables de entorno
$connection_string = getenv('PG_CONNECTION_STRING');

// Reemplazar el password en la cadena de conexión con asteriscos
$sanitized_connection_string = preg_replace('/password=[^;]+/', 'password=*******', $connection_string);

echo "PG_CONNECTION_STRING: {$sanitized_connection_string}<br>";

try {
    $pdo = new PDO($connection_string);
    $stmt = $pdo->query('SELECT version()');
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "PostgreSQL version: " . $row['version'];
} catch (PDOException $e) {
    echo "Error en la conexión: " . $e->getMessage();
}
?>
