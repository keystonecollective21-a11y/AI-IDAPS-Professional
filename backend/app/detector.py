from pathlib import Path
import joblib, numpy as np
from .train_model import train
F=['source_port','destination_port','duration','packets','bytes_transferred','syn_count','failed_connections']
class Detector:
    def __init__(self): self.model=None; self.path=Path(__file__).resolve().parent.parent/'models'/'intrusion_model.joblib'
    def ensure_model(self):
        if not self.path.exists(): train(self.path)
        self.model=joblib.load(self.path)
    def predict(self,flow):
        if self.model is None: self.ensure_model()
        x=np.array([[flow[k] for k in F]],dtype=float)
        label=str(self.model.predict(x)[0]); p=self.model.predict_proba(x)[0]
        return {'attack_type':label,'confidence':round(float(max(p)*100),2)}
detector=Detector()
