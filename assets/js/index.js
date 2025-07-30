$(document).ready(function() {
    const sheetId = "1FrCJK0o2_Dbj_xqAB30CNGOpLeIYPzKtnsXezkwA7NE"; // ID Google Sheets kamu
    const sheetName = "Sheet1";
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

    $.get(url, function (data) {
        const parsed = Papa.parse(data.trim(), { skipEmptyLines: true });
        const rows = parsed.data.map(cols => cols.map(col => col.trim()));

        // Tambahkan kolom "Status" di header
        const headerRow = [...rows[0], "Status"];
        $("#tableHead").html(headerRow.map(h => `<th>${h}</th>`).join(""));

        // Isi table body
        const bodyHTML = rows.slice(1)
            .map(cols => {
            const dataCells = cols.map(col => `<td>${col}</td>`).join("");
            const dropdown = `
                <td>
                <select class="status-dropdown">
                    <option value="Belum Hadir" selected>Belum Hadir</option>
                    <option value="Sudah Absen">Sudah Absen</option>
                </select>
                </td>
            `;
        return `<tr>${dataCells}${dropdown}</tr>`;
        }).join("");

        $("#tableBody").html(bodyHTML);

        // Event listener untuk dropdown
        $(".status-dropdown").on("change", function () {
            const selected = $(this).val();
            const row = $(this).closest("tr");
            const rowIndex = parseInt($(this).data("row"), 10);

            if (selected === "Sudah Absen") {
                row.addClass("sudah-absen");
            } else {
                row.removeClass("sudah-absen");
            }

            // Kirim ke backend (Vercel API)
            $.ajax({
                url: "/api/update-status",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    rowIndex: rowIndex,
                    status: selected
                }),
                success: function () {
                    console.log("Status updated in Google Sheets");
                    Swal.fire({
                        icon: "success",
                        title: "Berhasil!",
                        text: "Status di Google Sheets berhasil diperbarui."
                    });
                },
                error: function (xhr, status, error) {
                    console.log("Error updating status:" + error);
                    Swal.fire({
                        icon: "warning",
                        title: "Gagal!",
                        text: "Status di Google Sheets gagal diperbarui."
                    });
                }
            });
        });
    });
});