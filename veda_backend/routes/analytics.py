from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from veda_backend import models
from veda_backend.database import get_db
from veda_backend.routes.auth import get_current_issuer, get_current_admin

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

@router.get("/admin")
async def get_admin_analytics(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    # 1. Total Universities (Issuers)
    total_issuers = db.query(models.Issuer).count()
    active_issuers = db.query(models.Issuer).filter(models.Issuer.status == "Active").count()

    # 2. Total Diplomas Issued System-wide
    total_diplomas = db.query(models.DiplomaRecord).filter(
        models.DiplomaRecord.status == "Success"
    ).count()

    # 3. Diplomas per University (Top 5)
    top_issuers = db.query(
        models.Issuer.university_name,
        func.count(models.DiplomaRecord.id).label('count')
    ).join(models.DiplomaRecord, models.Issuer.id_issuer == models.DiplomaRecord.issued_by)\
     .filter(models.DiplomaRecord.status == "Success")\
     .group_by(models.Issuer.university_name)\
     .order_by(func.count(models.DiplomaRecord.id).desc())\
     .limit(5).all()

    # 4. Recent Activity (Last 10 issued diplomas across system)
    recent_activity = db.query(
        models.DiplomaRecord.student_name,
        models.DiplomaRecord.academic_degree,
        models.DiplomaRecord.issued_at,
        models.Issuer.university_name
    ).join(models.Issuer, models.DiplomaRecord.issued_by == models.Issuer.id_issuer)\
     .filter(models.DiplomaRecord.status == "Success")\
     .order_by(models.DiplomaRecord.issued_at.desc())\
     .limit(10).all()

    return {
        "total_issuers": total_issuers,
        "active_issuers": active_issuers,
        "total_diplomas": total_diplomas,
        "top_issuers": [{"university": i[0], "count": i[1]} for i in top_issuers],
        "recent_activity": [
            {
                "student_name": r[0],
                "degree": r[1],
                "issued_at": r[2],
                "university": r[3]
            } for r in recent_activity
        ]
    }
