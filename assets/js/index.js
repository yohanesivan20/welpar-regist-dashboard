$(document).ready(function () {
    const sheetId = "1FrCJK0o2_Dbj_xqAB30CNGOpLeIYPzKtnsXezkwA7NE";
    const sheetName = "Sheet1";
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

    let originalRows = [];

    $.get(url, function (data) {
        const parsed = Papa.parse(data.trim(), { skipEmptyLines: true });
        const rows = parsed.data.map(cols => cols.map(col => col.trim()));

        originalRows = rows.slice(1); // Simpan data asli

        const headerRow = ["No", ...rows[0]];
        $("#tableHead").html(
            headerRow.map(h => `<th>${h}</th>`).join("")
        );

        renderTable(originalRows);
    });

    function renderTable(filteredRows) {
        let totalHadir = 0;
        const totalPeserta = filteredRows.length;

        const bodyHTML = filteredRows.map((cols, index) => {
            const statusText = (cols[9] || "").toLowerCase() === "hadir" ? "Hadir" : "Terdaftar";
            if (statusText === "Hadir") totalHadir++;

            const bgStatusColor = statusText === "Hadir" ? "#b3ffb3" : "#f2ff7f";

            const statusDropdown = `
                <td class="status-cell" style="background-color: ${bgStatusColor};">
                    <select class="status-dropdown styled-dropdown" data-row="${index}">
                        <option value="Terdaftar" ${statusText === "Terdaftar" ? "selected" : ""}>Terdaftar</option>
                        <option value="Hadir" ${statusText === "Hadir" ? "selected" : ""}>Hadir</option>
                    </select>
                </td>
            `;

            cols[9] = statusDropdown;

            const dataCells = [
                `<td>${index + 1}</td>`,
                ...cols.map((col, i) => i === 9 ? col : `<td>${col}</td>`)
            ].join("");

            return `<tr>${dataCells}</tr>`;
        }).join("");

        $("#tableBody").html(bodyHTML);
        $("#totalHadir").text(formatSummary(totalHadir, totalPeserta));

        updateSummaryByKTM(filteredRows);

        bindDropdownEvents();
    }

    function updateSummaryByKTM(rows) {
        let totalSudah = 0;
        let totalBelum = 0;
        let hadirSudah = 0;
        let hadirBelum = 0;

        rows.forEach(cols => {
            const keanggotaan = (cols[6] || "").toLowerCase();
            const status = (cols[9] || "").toLowerCase();

            if (keanggotaan === "sudah bergabung ktm") {
                totalSudah++;
                if (status === "hadir") hadirSudah++;
            } else if (keanggotaan === "belum bergabung ktm") {
                totalBelum++;
                if (status === "hadir") hadirBelum++;
            }
        });

        $("#summaryKTM").text(`${hadirSudah} / ${hadirBelum}`);
    }

    function bindDropdownEvents() {
        $(".status-dropdown").on("change", function () {
            const selected = $(this).val();
            const cell = $(this).closest("td");
            const rowIndex = parseInt($(this).data("row"), 10);

            if (selected === "Hadir") {
                cell.css("background-color", "#b3ffb3");
            } else {
                cell.css("background-color", "#f2ff7f");
            }

            let hadir = 0;
            const total = $(".status-dropdown").length;
            $(".status-dropdown").each(function () {
                if ($(this).val() === "Hadir") hadir++;
            });

            $("#totalHadir").text(formatSummary(hadir, total));

            // Update KTM summary
            updateSummaryByKTM(originalRows);

            $.ajax({
                url: "/api/update-status",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({ rowIndex, status: selected }),
                success: () => Swal.fire({ icon: "success", title: "Berhasil!", text: "Status diperbarui." }),
                error: () => Swal.fire({ icon: "error", title: "Gagal!", text: "Gagal update status." })
            });
        });
    }

    function formatSummary(hadir, total) {
        const persen = total === 0 ? 0 : Math.round((hadir / total) * 100);
        return `${hadir} / ${total} (${persen}%)`;
    }

    // Sorting
    $("#sortNama").on("click", function () {
        const sorted = [...originalRows].sort((a, b) => a[1].localeCompare(b[1]));
        renderTable(sorted);
    });

    $("#sortTimestamp").on("click", function () {
        renderTable(originalRows);
    });

    $("#searchInput").on("keyup", function () {
        const keyword = $(this).val().toLowerCase();
        $("#tableBody tr").filter(function () {
            const rowText = $(this).text().toLowerCase();
            $(this).toggle(rowText.indexOf(keyword) > -1);
        });
    });
});
