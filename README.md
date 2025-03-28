# Perplexity MCP Server

Server MCP (Model Context Protocol) lokal yang menyediakan tool untuk berinteraksi dengan Perplexity AI API.

## Prasyarat

*   Node.js (versi 18 atau lebih baru direkomendasikan)
*   npm (biasanya terinstal bersama Node.js)
*   Kunci API Perplexity AI

## Instalasi

1.  Clone repositori ini (jika belum).
2.  Buka terminal di direktori proyek.
3.  Instal dependensi:
    ```bash
    npm install
    ```

## Konfigurasi

Server ini memerlukan kunci API Perplexity AI. Anda harus menyediakannya melalui environment variable `PERPLEXITY_API_KEY`.

Cara mengatur environment variable bergantung pada sistem operasi dan shell Anda:

*   **Linux/macOS (bash/zsh):**
    ```bash
    export PERPLEXITY_API_KEY="kunci_api_anda_disini" 
    ```
    Tambahkan baris ini ke file profil shell Anda (misalnya `~/.bashrc`, `~/.zshrc`) agar persisten.

*   **Windows (Command Prompt):**
    ```cmd
    set PERPLEXITY_API_KEY=kunci_api_anda_disini
    ```

*   **Windows (PowerShell):**
    ```powershell
    $env:PERPLEXITY_API_KEY = "kunci_api_anda_disini"
    ```

**Penting:** Ganti `"kunci_api_anda_disini"` dengan kunci API Perplexity Anda yang sebenarnya. **Jangan** memasukkan kunci API langsung ke dalam kode atau file `README.md`.

## Menjalankan Server

1.  **Build Kode (kompilasi TypeScript ke JavaScript):**
    ```bash
    npm run build
    ```
    Perintah ini akan membuat direktori `build` berisi file JavaScript yang sudah dikompilasi.

2.  **Jalankan Server:**
    Pastikan environment variable `PERPLEXITY_API_KEY` sudah diatur di terminal Anda.
    ```bash
    npm start
    ```
    Server akan berjalan dan mendengarkan instruksi MCP melalui stdio. Anda akan melihat pesan seperti `Perplexity MCP server running on stdio` di stderr jika berhasil.

## Pengembangan (Opsional)

Untuk pengembangan, Anda dapat menggunakan perintah `dev` yang akan otomatis mengkompilasi ulang dan menjalankan server setiap kali ada perubahan pada file TypeScript:

```bash
npm run dev
```

## Penggunaan

Server ini menyediakan tool `query_perplexity` yang dapat dipanggil oleh klien MCP.

**Input:**
```json
{
  "prompt": "Pertanyaan atau instruksi Anda untuk Perplexity"
}
```

**Output:**
Jawaban teks dari Perplexity AI.