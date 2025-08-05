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
            lengthChange: true,
            lengthMenu: [5, 10, 25],
            searching: true,
            ordering: true,
            info: false,
            autoWidth: false,
            scrollX: true,
            dom: '<"top">rt<"bottom"lp>',  // length (l) + pagination (p) di bagian bawah
            columnDefs: [
            {
                targets: 9,
                width: '100px',
            },
            {
                targets: 10,
                orderable: false
            },
            {
                targets: 4,
                orderable: false
            },
            {
                targets: 3,
                visible: false
            },
            {
                targets: '_all',
                className: 'dt-center dt-head-center' // tengahkan header dan isi sel
            }
        ]
        });

        $("#searchInput").on("keyup change", function () {
            table.search(this.value).draw();
        });

        // Tombol sorting dengan DataTables API
        $("#sortNama").on("click", function () {
            if (table) {
                table.order([2, 'asc']).draw(); // Nama ada di index ke-2 (misalnya)
            }
        });

        $("#sortTimestamp").on("click", function () {
            if (table) {
                table.order([1, 'asc']).draw(); // Timestamp/No di index ke-1 (misalnya)
            }
        });

        $("#summaryCamping").on("click", function () {
            let summary = {
                "Belum Pernah": 0,
                "Pernah di Tumpang": 0,
                "Pernah di Cikanyere": 0,
                "Pernah di Bandol": 0
            };

            table.rows().every(function () {
                const $row = $(this.node());
                const camping = $row.find("td").eq(8).text().trim();

                if (summary.hasOwnProperty(camping)) {
                    summary[camping]++;
                }
            });

            const total = table.rows().count();
            const format = (value) => `${value} (${Math.round((value / total) * 100)}%)`;

            Swal.fire({
                icon: "info",
                title: "Data Peserta Camping",
                html: `
                    <ul style="text-align: left; line-height: 1.8;">
                        <li><strong>Belum Pernah:</strong> ${format(summary["Belum Pernah"])}</li>
                        <li><strong>Pernah di Tumpang:</strong> ${format(summary["Pernah di Tumpang"])}</li>
                        <li><strong>Pernah di Cikanyere:</strong> ${format(summary["Pernah di Cikanyere"])}</li>
                        <li><strong>Pernah di Bandol:</strong> ${format(summary["Pernah di Bandol"])}</li>
                    </ul>
                `,
                confirmButtonText: "Tutup"
            });
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

            let table = $('#attendanceTable').DataTable();

            // Hitung ulang total hadir
            let hadir = 0;
            let hadirKtm = 0;
            let hadirNon = 0;
            let hadirBottomAge = 0;
            let hadirMiddleAge = 0;
            let hadirTopAge = 0;

            table.rows().every(function () {
                const $row = $(this.node());
                const dropdownVal = $row.find(".status-dropdown").val();
                const keanggotaan = $row.find("td").eq(6).text().toLowerCase();
                const umur = $row.find("td").eq(4).text().toLowerCase();

                if (dropdownVal === "Hadir") {
                    hadir++;

                    if (keanggotaan === "sudah bergabung ktm") hadirKtm++;
                    else if (keanggotaan === "belum bergabung ktm") hadirNon++;

                    if (umur === "8-17 tahun") hadirBottomAge++;
                    else if (umur === "17-25 tahun" || umur === "26-30 tahun") hadirMiddleAge++;
                    else if (umur === "31-40 tahun" || umur === ">40 tahun") hadirTopAge++;
                }
            });

            $("#totalHadir").text(formatSummary(hadir, table.rows().count()));
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
                        text: "Gagal update status. Silahkan hubungi developer!."
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
});
