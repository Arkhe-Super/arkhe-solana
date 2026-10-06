use c2pa::Reader;
use std::io::Cursor;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn verify_c2pa_manifest(data: &[u8], format: &str) -> Result<String, JsValue> {
    match Reader::from_stream(format, &mut Cursor::new(data)) {
        Ok(reader) => {
            if let Some(manifest) = reader.active_manifest() {
                Ok(format!(
                    "{{\"status\": \"success\", \"active_manifest\": \"{}\"}}",
                    manifest.label().unwrap_or_default()
                ))
            } else {
                Err(JsValue::from_str("No active manifest found"))
            }
        }
        Err(e) => Err(JsValue::from_str(&format!("Verification failed: {}", e))),
    }
}
