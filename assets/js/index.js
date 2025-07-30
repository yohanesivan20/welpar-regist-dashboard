$(document).ready(function() {
    const sheetId = "1FrCJK0o2_Dbj_xqAB30CNGOpLeIYPzKtnsXezkwA7NE";
    const sheetName = "Sheet1";
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

    $.get(url, function(data) {
        const parsed = Papa.parse(data.trim(), { skipEmptyLines: true });
        const rows = parsed.data.map(cols => cols.map(col => col.trim()));

        // Tambahkan kolom "No", header asli, dan "Status"
        const headerRow = ["No", ...rows[0]];
        $("#tableHead").html(headerRow
            .map((h, i) =>
            i === headerRow.length - 1
                ? `<th class="status-header">${h}</th>`
                : `<th>${h}</th>`
        )
        .join(""));

        let totalHadir = 0;
        const totalPeserta = rows.length - 1;

        // Isi table body
        const bodyHTML = rows.slice(1)
            .map((cols, index) => {
                const statusText = (cols[9] || "").toLowerCase() === "hadir" ? "Hadir" : "Terdaftar";
                if (statusText === "Hadir") totalHadir++;

                const bgStatusColor = statusText === "Hadir" ? "#b3ffb3" : "#f2ff7f";

                // dropdown tetap ditaruh dalam kolom ke-10 (status)
                 const statusDropdown = `
                    <td class="status-cell" style="background-color: ${bgStatusColor};">
                        <select class="status-dropdown styled-dropdown" data-row="${index}">
                            <option style="text-indent: 1px;" value="Terdaftar" ${statusText === "Terdaftar" ? "selected" : ""}>Terdaftar</option>
                            <option style="text-indent: 1px;" value="Hadir" ${statusText === "Hadir" ? "selected" : ""}>Hadir</option>
                        </select>
                    </td>
                `;

                // Replace kolom status (index 9) dengan dropdown
                cols[9] = statusDropdown;

                const dataCells = [
                    `<td>${index + 1}</td>`,
                    ...cols.map((col, i) => i === 9 ? col : `<td>${col}</td>`) // render cell biasa kecuali status
                ].join("");

                return `<tr>${dataCells}</tr>`;
            }).join("");

        $("#tableBody").html(bodyHTML);

        // Tampilkan total hadir
        $("#totalHadir").text(`${totalHadir} / ${totalPeserta}`);

        // Event listener untuk dropdown
        $(".status-dropdown").on("change", function () {
            const selected = $(this).val();
            const cell = $(this).closest("td");
            const rowIndex = parseInt($(this).data("row"), 10);

            if (selected === "Hadir") {
                cell.addClass("sudah-absen");
                cell.removeClass("belum-hadir");
            } else {
                cell.removeClass("sudah-absen");
                cell.addClass("belum-hadir");
            }

            // Hitung total hadir ulang
            let hadir = 0;
            const total = $(".status-dropdown").length;

            $(".status-dropdown").each(function () {
                if ($(this).val() === "Hadir") hadir++;
            });

            $("#totalHadir").text(`${hadir} / ${total}`);

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

        // Fitur pencarian
        $("#searchInput").on("keyup", function () {
            const keyword = $(this).val().toLowerCase();

            $("#tableBody tr").filter(function () {
                const rowText = $(this).text().toLowerCase();
                $(this).toggle(rowText.indexOf(keyword) > -1);
            });
        });
    });
});
