extern crate napi_build;

fn main() {
    napi_build::setup();

    if std::env::var("CARGO_CFG_TARGET_OS").unwrap() == "windows" {
        println!("cargo:rustc-link-lib=advapi32");
        println!("cargo:rustc-link-lib=user32");
    }
}
