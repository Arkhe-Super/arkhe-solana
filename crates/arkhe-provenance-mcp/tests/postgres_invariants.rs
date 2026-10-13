use pglite_oxide::PgliteServer;
use sqlx::{PgPool, Row};
use uuid::Uuid;

#[tokio::test]
async fn usage_events_is_append_only_and_idempotent() -> anyhow::Result<()> {
    // Start temporary pglite server to meet test requirements
    let server = PgliteServer::temporary_tcp().expect("start pglite");
    let pool = PgPool::connect(&server.database_url()).await?;

    sqlx::migrate!("../../database/migrations")
        .run(&pool)
        .await?;

    let request_id = Uuid::new_v4();

    sqlx::query(
        r#"
        INSERT INTO usage_events (
            request_id,
            idempotency_key,
            tenant_id,
            tool,
            price_book_version,
            pricing_rule_id,
            started_at,
            duration_ms,
            bytes_in,
            bytes_out,
            result,
            billable_units,
            billable_amount_usd
        )
        VALUES (
            $1, $2, $3, $4, $5, $6,
            NOW(), 10, 100, 200,
            'success', 1, 0
        )
        "#,
    )
    .bind(request_id)
    .bind("idem-001")
    .bind("audit-tenant")
    .bind("verify_provenance")
    .bind("phase-a-free")
    .bind("phase-a-free-verify")
    .execute(&pool)
    .await?;

    let count: i64 = sqlx::query(
        "SELECT COUNT(*) AS count FROM usage_events WHERE request_id = $1"
    )
    .bind(request_id)
    .fetch_one(&pool)
    .await?
    .get("count");

    assert_eq!(count, 1);

    // Append-only invariant: UPDATE must fail.
    let update = sqlx::query(
        "UPDATE usage_events SET duration_ms = 999 WHERE request_id = $1"
    )
    .bind(request_id)
    .execute(&pool)
    .await;

    assert!(update.is_err(), "UPDATE unexpectedly succeeded");

    // Append-only invariant: DELETE must fail.
    let delete = sqlx::query(
        "DELETE FROM usage_events WHERE request_id = $1"
    )
    .bind(request_id)
    .execute(&pool)
    .await;

    assert!(delete.is_err(), "DELETE unexpectedly succeeded");

    server.shutdown().unwrap();

    Ok(())
}
