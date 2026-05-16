from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from database import get_db
from routes.auth import get_current_issuer

router = APIRouter()

@router.get("/issuer")
async def get_issuer_analytics(
    db: Session = Depends(get_db),
    current_issuer: models.Issuer = Depends(get_current_issuer)
):
    issuer_id = current_issuer.id_issuer

    # 1. Total Diplomas
    total_diplomas = db.query(models.DiplomaRecord).filter(
        models.DiplomaRecord.issued_by == issuer_id,
        models.DiplomaRecord.status == "Success"
    ).count()

    # 2. Diplomas by Academic Degree
    degree_counts = db.query(
        models.DiplomaRecord.academic_degree,
        func.count(models.DiplomaRecord.id).label('count')
    ).filter(
        models.DiplomaRecord.issued_by == issuer_id,
        models.DiplomaRecord.status == "Success"
    ).group_by(models.DiplomaRecord.academic_degree).all()

    # 3. Diplomas by Study Program
    program_counts = db.query(
        models.DiplomaRecord.study_program_name,
        func.count(models.DiplomaRecord.id).label('count')
    ).filter(
        models.DiplomaRecord.issued_by == issuer_id,
        models.DiplomaRecord.status == "Success"
    ).group_by(models.DiplomaRecord.study_program_name).all()

    # 4. Recent Activity (Last 5 issued diplomas)
    recent_diplomas = db.query(models.DiplomaRecord).filter(
        models.DiplomaRecord.issued_by == issuer_id,
        models.DiplomaRecord.status == "Success"
    ).order_by(models.DiplomaRecord.issued_at.desc()).limit(5).all()

    return {
        "total": total_diplomas,
        "degrees": [{"name": d[0], "count": d[1]} for d in degree_counts],
        "programs": [{"name": p[0], "count": p[1]} for p in program_counts],
        "recent": [
            {
                "student_name": r.student_name,
                "student_id": r.student_id,
                "degree": r.academic_degree,
                "program": r.study_program_name,
                "issued_at": r.issued_at
            } for r in recent_diplomas
        ]
    }
