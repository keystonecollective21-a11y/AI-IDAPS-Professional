from pathlib import Path
import numpy as np
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score


F = [
    "source_port",
    "destination_port",
    "duration",
    "packets",
    "bytes_transferred",
    "syn_count",
    "failed_connections"
]


def train(output=None):

    rng = np.random.default_rng(42)

    X = []
    y = []

    # ============================================================
    # NORMAL TRAFFIC
    # ============================================================

    for _ in range(1000):

        X.append([
            rng.integers(1024, 65535),       # source_port
            rng.choice([80, 443, 53, 123]),  # destination_port
            rng.uniform(2, 30),               # duration
            rng.integers(5, 100),             # packets
            rng.integers(1000, 60000),        # bytes
            rng.integers(0, 8),               # syn_count
            rng.integers(0, 3)                # failed_connections
        ])

        y.append("Normal")


    # ============================================================
    # DOS
    # ============================================================

    for _ in range(700):

        X.append([
            rng.integers(1024, 65535),       # source_port
            rng.choice([80, 443]),           # destination_port
            rng.uniform(0.05, 5),            # short duration
            rng.integers(300, 1800),         # very high packets
            rng.integers(30000, 200000),     # very high bytes
            rng.integers(150, 1500),         # very high SYN
            rng.integers(0, 40)              # failures
        ])

        y.append("DoS")


    # ============================================================
    # BRUTE FORCE
    # ============================================================

    for _ in range(700):

        X.append([
            rng.integers(1024, 65535),       # source_port
            22,                              # SSH
            rng.uniform(5, 45),              # longer duration
            rng.integers(20, 300),           # moderate packets
            rng.integers(2000, 45000),       # moderate bytes
            rng.integers(1, 20),             # low SYN
            rng.integers(15, 120)            # many failures
        ])

        y.append("Brute Force")


    # ============================================================
    # CONVERT DATA
    # ============================================================

    X = np.array(X, dtype=float)
    y = np.array(y)


    # ============================================================
    # TRAIN / TEST SPLIT
    # ============================================================

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )


    # ============================================================
    # RANDOM FOREST
    # ============================================================

    model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        class_weight="balanced",
        max_depth=14,
        min_samples_leaf=2,
        n_jobs=-1
    )

    model.fit(X_train, y_train)


    # ============================================================
    # MODEL TEST
    # ============================================================

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    print("\n====================================")
    print("AI-IDAPS MODEL TRAINING")
    print("====================================")

    print(
        f"Training samples : {len(X_train)}"
    )

    print(
        f"Testing samples  : {len(X_test)}"
    )

    print(
        f"Accuracy         : {accuracy * 100:.2f}%"
    )

    print("\nClassification Report:")

    print(
        classification_report(
            y_test,
            predictions
        )
    )


    # ============================================================
    # SAVE MODEL
    # ============================================================

    output = (
        output
        or
        Path(__file__).resolve().parent.parent
        / "models"
        / "intrusion_model.joblib"
    )

    output.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    joblib.dump(
        model,
        output
    )

    print(
        f"\nModel saved to:\n{output}"
    )

    print(
        "\nClasses:",
        list(model.classes_)
    )

    return output