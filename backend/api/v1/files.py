from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User as UserModel, UserRole
from auth import get_current_active_user, require_any_role
from config import settings
import os
import uuid
from datetime import datetime
from typing import List

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Загрузка файла"""
    
    # Проверяем размер файла
    if file.size and file.size > settings.max_file_size:
        raise HTTPException(
            status_code=413,
            detail=f"Файл слишком большой. Максимальный размер: {settings.max_file_size} байт"
        )
    
    # Проверяем тип файла
    file_extension = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    if file_extension not in settings.allowed_file_types_list:
        raise HTTPException(
            status_code=400,
            detail=f"Неподдерживаемый тип файла. Разрешенные типы: {', '.join(settings.allowed_file_types_list)}"
        )
    
    try:
        # Генерируем уникальное имя файла
        file_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
        new_filename = f"{file_id}.{file_extension}"
        
        # Сохраняем файл
        file_path = os.path.join(settings.upload_dir, new_filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Получаем размер файла
        file_size = len(content)
        
        return {
            "message": "Файл успешно загружен",
            "file_id": file_id,
            "filename": file.filename,
            "file_path": f"/uploads/{new_filename}",
            "file_size": file_size,
            "file_type": file.content_type,
            "uploaded_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при загрузке файла: {str(e)}"
        )

@router.get("/download/{file_id}")
async def download_file(
    file_id: str,
    current_user: UserModel = Depends(get_current_active_user)
):
    """Скачивание файла по ID"""
    
    # Ищем файл в директории uploads
    upload_dir = settings.upload_dir
    for filename in os.listdir(upload_dir):
        if filename.startswith(file_id):
            file_path = os.path.join(upload_dir, filename)
            if os.path.isfile(file_path):
                return FileResponse(
                    path=file_path,
                    filename=filename,
                    media_type='application/octet-stream'
                )
    
    raise HTTPException(
        status_code=404,
        detail="Файл не найден"
    )

@router.get("/list")
async def list_files(
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """Список всех загруженных файлов (только для админов и менеджеров)"""
    
    try:
        upload_dir = settings.upload_dir
        files = []
        
        if os.path.exists(upload_dir):
            for filename in os.listdir(upload_dir):
                file_path = os.path.join(upload_dir, filename)
                if os.path.isfile(file_path):
                    stat = os.stat(file_path)
                    files.append({
                        "filename": filename,
                        "file_id": filename.split('.')[0],
                        "file_size": stat.st_size,
                        "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                        "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat()
                    })
        
        return {
            "files": files,
            "total": len(files)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении списка файлов: {str(e)}"
        )

@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    current_user: UserModel = Depends(require_any_role([UserRole.ADMIN, UserRole.MANAGER])),
    db: Session = Depends(get_db)
):
    """Удаление файла (только для админов и менеджеров)"""
    
    try:
        upload_dir = settings.upload_dir
        
        # Ищем файл
        for filename in os.listdir(upload_dir):
            if filename.startswith(file_id):
                file_path = os.path.join(upload_dir, filename)
                if os.path.isfile(file_path):
                    os.remove(file_path)
                    return {
                        "message": "Файл успешно удален",
                        "file_id": file_id
                    }
        
        raise HTTPException(
            status_code=404,
            detail="Файл не найден"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при удалении файла: {str(e)}"
        )
