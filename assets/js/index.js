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
        let hadirKtm = 0;
        let hadirNon = 0;
        let hadirBottomAge = 0;
        let hadirMiddleAge = 0;
        let hadirTopAge = 0;

        const totalPeserta = filteredRows.length;

        const bodyHTML = filteredRows.map((cols, index) => {
            const statusText = (cols[9] || "").toLowerCase() === "hadir" ? "Hadir" : "Terdaftar";
            const keanggotaan = (cols[6] || "").toLowerCase();
            const umur = (cols[4] || "").toLowerCase();

            //For Summary KTM
            if (keanggotaan === "sudah bergabung ktm") {
                if (statusText === "Hadir") hadirKtm++;
            } else if (keanggotaan === "belum bergabung ktm") {
                if (statusText === "Hadir") hadirNon++;
            }

            //For Summary Age
            if (umur === "8-17 tahun") {
                if (statusText === "Hadir") hadirBottomAge++;
            } else if (umur === "17-25 tahun" || umur === "26-30 tahun") {
                if (statusText === "Hadir") hadirMiddleAge++;
            } else if (umur === "31-40 tahun" || umur === ">40 tahun") {
                if (statusText === "Hadir") hadirTopAge++;
            }

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
        $('#summaryKTM').text(`${hadirKtm} / ${hadirNon}`);
        $('#summaryAge').text(`${hadirBottomAge} / ${hadirMiddleAge} / ${hadirTopAge}`)

        bindDropdownEvents();

        // Inisialisasi DataTable
        if ($.fn.DataTable.isDataTable('#attendanceTable')) {
            $('#attendanceTable').DataTable().destroy();
        }
        let table = $('#attendanceTable').DataTable({
            pageLength: 5,
            lengthChange: false,
            searching: true,
            ordering: false,
            info: false,
            autoWidth: true,
            dom: 'lrtip',
            columnDefs: [
            {
                targets: 4,
                visibile: false
            },
            {
                targets: 2,            // kolom kedua (index dimulai dari 0)
                width: '300px'         // atur sesuai kebutuhan
            },
            {
                targets: '_all',
                className: 'dt-center dt-head-center' // tengahkan header dan isi sel
            }
        ]
        });

        $("#searchInput").on("keyup change", function () {
            // const keyword = $(this).val().toLowerCase();
            // $("#tableBody tr").filter(function () {
            //     const rowText = $(this).text().toLowerCase();
            //     $(this).toggle(rowText.indexOf(keyword) > -1);
            // });

            table.search(this.value).draw();
        });
    }

    function bindDropdownEvents() {
        $(".status-dropdown").on("change", function () {
            const selected = $(this).val();
            const cell = $(this).closest("td");
            const rowIndex = parseInt($(this).data("row"), 10);

            // Ubah warna latar dropdown
            if (selected === "Hadir") {
                cell.css("background-color", "#b3ffb3");
            } else {
                cell.css("background-color", "#f2ff7f");
            }

            // Hitung ulang total hadir
            let hadir = 0;
            let hadirKtm = 0;
            let hadirNon = 0;
            let hadirBottomAge = 0;
            let hadirMiddleAge = 0;
            let hadirTopAge = 0;

            $("#tableBody tr").each(function (i) {
                const dropdown = $(this).find(".status-dropdown").val();
                const keanggotaan = $(this).find("td").eq(7).text().toLowerCase(); // col[6] berarti <td>.eq(7)
                const umur = $(this).find("td").eq(5).text().toLowerCase(); // col[4] berarti <td>.eq(5)

                if (dropdown === "Hadir") {
                    hadir++;

                    //For Summary KTM
                    if (keanggotaan === "sudah bergabung ktm") hadirKtm++;
                    else if (keanggotaan === "belum bergabung ktm") hadirNon++;

                    //For Summary Age
                    if (umur === "8-17 tahun") hadirBottomAge++;
                    else if (umur === "17-25 tahun" || umur === "26-30 tahun") hadirMiddleAge++;
                    else if (umur === "31-40 tahun" || umur === ">40 tahun") hadirTopAge++;
                }
            });

            $("#totalHadir").text(formatSummary(hadir, $(".status-dropdown").length));
            $("#summaryKTM").text(`${hadirKtm} / ${hadirNon}`);
            $("#summaryAge").text(`${hadirBottomAge} / ${hadirMiddleAge} / ${hadirTopAge}`);

            // AJAX update
            $.ajax({
                url: "/api/update-status",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({ rowIndex, status: selected }),
                beforeSend: function () {
                    Swal.fire({
                        title: "Memproses...",
                        text: "Sedang mengupdate status ke Google Sheets",
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });
                },
                success: () => Swal.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Status diperbarui."
                }),
                error: () => {
                    Swal.fire({
                        icon: "error",
                        title: "Gagal!",
                        text: "Gagal update status. Halaman akan direfresh."
                    }).then(() => {
                        window.location.reload();
                    });
                }
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
});
