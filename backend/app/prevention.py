class Prevention:
    def decide(self,r):
        if r['attack_type']=='Normal': return {'action':'ALLOW','status':'ALLOWED'}
        if r['confidence']>=85: return {'action':'TEMP_BLOCK_SIMULATED','status':'BLOCKED'}
        return {'action':'ALERT_ONLY','status':'ALERT'}
prevention=Prevention()
