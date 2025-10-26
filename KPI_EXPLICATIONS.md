# 📊 Guide des KPI de Monitoring Serveur

Ce document explique tous les indicateurs (KPI) collectés par le script de monitoring.

---

## 🕐 Timestamp
```json
"timestamp": 1729875123.456
```
**C'est quoi ?** L'heure exacte de la collecte des données (en secondes depuis le 1er janvier 1970).

**Pourquoi c'est important ?** Permet de savoir quand les données ont été collectées et de créer des graphiques temporels.

---

## 🖥️ CPU (Processeur)

### 1. `cpu_percent`
```json
"cpu_percent": 45.2
```
**C'est quoi ?** Le pourcentage d'utilisation globale du processeur.

**Comment l'interpréter ?**
- **0-50%** : Utilisation normale ✅
- **50-80%** : Charge moyenne ⚠️
- **80-100%** : Charge élevée, risque de ralentissement ❌

**Exemple concret :** Si `cpu_percent = 85%`, cela signifie que le CPU travaille à 85% de sa capacité maximale.

---

### 2. `cpu_count_logical` et `cpu_count_physical`
```json
"cpu_count_logical": 8,
"cpu_count_physical": 4
```
**C'est quoi ?**
- **Logical** : Nombre de cœurs virtuels (avec Hyper-Threading)
- **Physical** : Nombre de cœurs physiques réels

**Exemple concret :** Un processeur Intel i5 avec 4 cœurs physiques et Hyper-Threading aura 8 cœurs logiques.

**Pourquoi c'est important ?** Pour calculer si le serveur est surchargé (voir `load_avg`).

---

### 3. `cpu_per_core`
```json
"cpu_per_core": [23.5, 67.8, 45.2, 12.1, 89.3, 34.5, 56.7, 21.4]
```
**C'est quoi ?** L'utilisation de chaque cœur CPU individuellement (en %).

**Pourquoi c'est important ?** Permet de détecter si un cœur est saturé alors que les autres sont peu utilisés (problème de parallélisation).

---

### 4. `cpu_freq`
```json
"cpu_freq": {
    "current": 2400.0,
    "min": 800.0,
    "max": 3500.0
}
```
**C'est quoi ?** La fréquence du processeur en MHz (MégaHertz).

**Comment l'interpréter ?**
- **Current** : Fréquence actuelle
- **Min/Max** : Plage de fréquences (le CPU s'ajuste selon la charge)

**Exemple concret :** Un CPU à 2400 MHz traite 2,4 milliards d'opérations par seconde.

---

### 5. `load_avg`
```json
"load_avg": [1.5, 2.3, 2.8]
```
**C'est quoi ?** La charge moyenne du système sur 1, 5 et 15 minutes.

**Comment l'interpréter ?**
- **Charge < nombre de cœurs** : Système sain ✅
- **Charge ≈ nombre de cœurs** : Système chargé ⚠️
- **Charge > nombre de cœurs** : Système surchargé ❌

**Exemple concret :** 
- Si vous avez 4 cœurs et `load_avg = [2.0, 1.8, 1.5]` → OK ✅
- Si vous avez 4 cœurs et `load_avg = [8.5, 7.2, 6.1]` → Surchargé ❌

---

## 💾 Memory (Mémoire RAM)

### 1. `virtual` (RAM)
```json
"virtual": {
    "total": 16777216000,
    "available": 8388608000,
    "used": 7340032000,
    "percent": 50.0,
    "free": 1049184000,
    "active": 6291456000,
    "inactive": 2097152000,
    "buffers": 524288000,
    "cached": 3145728000
}
```

**Les KPI importants :**

#### `total`
**C'est quoi ?** Mémoire RAM totale installée (en bytes).
**Exemple :** `16777216000` bytes = 16 GB

#### `available`
**C'est quoi ?** Mémoire réellement disponible pour les nouvelles applications.
**⚠️ IMPORTANT :** C'est le meilleur indicateur pour savoir si vous avez assez de RAM.

#### `used`
**C'est quoi ?** Mémoire actuellement utilisée.

#### `percent`
**C'est quoi ?** Pourcentage de RAM utilisée.

**Comment l'interpréter ?**
- **0-70%** : Normal ✅
- **70-85%** : Attention ⚠️
- **85-100%** : Risque de swap et ralentissement ❌

#### `cached` et `buffers`
**C'est quoi ?** Mémoire utilisée pour accélérer l'accès aux fichiers.
**Bon à savoir :** Cette mémoire peut être libérée instantanément si nécessaire.

---

### 2. `swap` (Mémoire d'échange)
```json
"swap": {
    "total": 8589934592,
    "used": 1073741824,
    "free": 7516192768,
    "percent": 12.5
}
```

**C'est quoi ?** Espace disque utilisé comme extension de la RAM.

**Comment l'interpréter ?**
- **0-10%** : Normal ✅
- **10-50%** : RAM insuffisante ⚠️
- **> 50%** : Problème sérieux de mémoire ❌

**Pourquoi c'est grave ?** Le swap est 100x plus lent que la RAM → ralentissements importants.

---

## 💿 Disk (Disque dur)

### 1. `usage`
```json
"usage": {
    "total": 500000000000,
    "used": 350000000000,
    "free": 150000000000,
    "percent": 70.0
}
```

**C'est quoi ?** L'espace disque utilisé.

**Comment l'interpréter ?**
- **0-80%** : OK ✅
- **80-90%** : Faire du ménage ⚠️
- **> 90%** : Critique, peut bloquer le système ❌

---

### 2. `io_counters`
```json
"io_counters": {
    "read_count": 123456,
    "write_count": 654321,
    "read_bytes": 5368709120,
    "write_bytes": 10737418240,
    "read_time": 12345,
    "write_time": 23456
}
```

**C'est quoi ?** Les statistiques de lecture/écriture sur le disque.

#### `read_bytes` / `write_bytes`
**C'est quoi ?** Quantité de données lues/écrites depuis le démarrage (en bytes).

#### `read_count` / `write_count`
**C'est quoi ?** Nombre d'opérations de lecture/écriture.

**Pourquoi c'est important ?** Détecte les applications qui sollicitent trop le disque (ralentissements).

---

## 🌐 Network (Réseau)

### 1. `io_counters`
```json
"io_counters": {
    "bytes_sent": 1073741824,
    "bytes_recv": 2147483648,
    "packets_sent": 1000000,
    "packets_recv": 1500000,
    "errin": 0,
    "errout": 0,
    "dropin": 0,
    "dropout": 0
}
```

#### `bytes_sent` / `bytes_recv`
**C'est quoi ?** Quantité de données envoyées/reçues depuis le démarrage (en bytes).
**Exemple :** `1073741824` bytes = 1 GB

#### `packets_sent` / `packets_recv`
**C'est quoi ?** Nombre de paquets réseau envoyés/reçus.

#### `errin` / `errout` / `dropin` / `dropout`
**C'est quoi ?** Erreurs et paquets perdus.

**Comment l'interpréter ?**
- **0** : Parfait ✅
- **> 0** : Problèmes réseau possibles ⚠️

---

### 2. `connections_count`
```json
"connections_count": 42
```
**C'est quoi ?** Nombre de connexions réseau actives.

**Exemple :** Connexions HTTP, SSH, base de données, etc.

**Pourquoi c'est important ?** Un nombre anormalement élevé peut indiquer une attaque DDoS.

---

## ⚙️ System (Système)

### 1. `boot_time`
```json
"boot_time": 1729700000.0
```
**C'est quoi ?** Le timestamp du dernier démarrage du serveur.

---

### 2. `uptime_seconds`
```json
"uptime_seconds": 175123.456
```
**C'est quoi ?** Depuis combien de temps le serveur est allumé (en secondes).

**Conversion :**
- `175123` secondes = 2 jours, 48 heures environ

**Pourquoi c'est important ?** 
- Un uptime long = serveur stable ✅
- Redémarrages fréquents = problèmes possibles ⚠️

---

### 3. `process_count`
```json
"process_count": 256
```
**C'est quoi ?** Nombre de processus (programmes) en cours d'exécution.

**Comment l'interpréter ?**
- **50-200** : Normal pour un serveur ✅
- **> 500** : Possible problème (fork bomb, malware) ⚠️

---

## 🎯 Résumé : Les KPI critiques à surveiller

| KPI | Seuil WARNING | Seuil CRITICAL |
|-----|---------------|----------------|
| `cpu_percent` | > 80% | > 90% |
| `memory.percent` | > 85% | > 95% |
| `swap.percent` | > 10% | > 50% |
| `disk.percent` | > 85% | > 95% |
| `load_avg[0]` | > nb_cores | > 2x nb_cores |
| `network.errin/errout` | > 0 | > 100 |

---

## 📈 Comment utiliser ces données ?

### Pour un dashboard :
1. **Temps réel** : Afficher `cpu_percent`, `memory.percent`, `disk.percent`
2. **Graphiques** : Tracer l'évolution sur 24h
3. **Alertes** : Déclencher des notifications si seuils dépassés

### Calculs utiles :
```python
# Convertir bytes en GB
gb = bytes / (1024 ** 3)

# Convertir uptime en jours
days = uptime_seconds / 86400

# Calculer débit réseau (MB/s)
bandwidth_mbps = (bytes_sent + bytes_recv) / 1_000_000 / uptime_seconds
```

---

**💡 Conseil :** Collectez ces données toutes les 30-60 secondes pour avoir un monitoring en temps réel efficace !
