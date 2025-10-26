from src.core.supabase import get_supabase


def sb_insert_job(job):
    sb = get_supabase()
    sb.table("jobs").insert(job).execute()


def sb_update_job(jid, **fields):
    sb = get_supabase()
    sb.table("jobs").update(fields).eq("id", jid).execute()


def sb_get_job(jid):
    sb = get_supabase()
    return sb.table("jobs").select("*").eq("id", jid).single().execute().data
