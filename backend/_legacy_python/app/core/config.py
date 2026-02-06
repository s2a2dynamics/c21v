from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "C21V AI Assistant"
    API_V1_STR: str = "/api/v1"
    
    # GCP Config (To be populated)
    GOOGLE_CLOUD_PROJECT: str = "c21v-project-id"
    
    class Config:
        case_sensitive = True

settings = Settings()
