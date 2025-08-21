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

    // function renderTable(filteredRows) {
    //     let totalHadir = 0;
    //     let hadirKtm = 0;
    //     let hadirNon = 0;
    //     let hadirBottomAge = 0;
    //     let hadirMiddleAge = 0;
    //     let hadirTopAge = 0;

    //     const totalPeserta = filteredRows.length;

    //     const bodyHTML = filteredRows.map((cols, index) => {
    //         const statusText = (cols[9] || "").toLowerCase() === "hadir" ? "Hadir" : "Terdaftar";
    //         const keanggotaan = (cols[6] || "").toLowerCase();
    //         const umur = (cols[4] || "").toLowerCase();

    //         //For Summary KTM
    //         if (keanggotaan === "sudah bergabung ktm") {
    //             if (statusText === "Hadir") hadirKtm++;
    //         } else if (keanggotaan === "belum bergabung ktm") {
    //             if (statusText === "Hadir") hadirNon++;
    //         }

    //         //For Summary Age
    //         if (umur === "8-17 tahun") {
    //             if (statusText === "Hadir") hadirBottomAge++;
    //         } else if (umur === "17-25 tahun" || umur === "26-30 tahun") {
    //             if (statusText === "Hadir") hadirMiddleAge++;
    //         } else if (umur === "31-40 tahun" || umur === ">40 tahun") {
    //             if (statusText === "Hadir") hadirTopAge++;
    //         }

    //         if (statusText === "Hadir") totalHadir++;

    //         const bgStatusColor = statusText === "Hadir" ? "#b3ffb3" : "#f2ff7f";

    //         const statusDropdown = `
    //             <td class="status-cell" style="background-color: ${bgStatusColor};">
    //                 <select class="status-dropdown styled-dropdown" data-row="${index}">
    //                     <option value="Terdaftar" ${statusText === "Terdaftar" ? "selected" : ""}>Terdaftar</option>
    //                     <option value="Hadir" ${statusText === "Hadir" ? "selected" : ""}>Hadir</option>
    //                 </select>
    //             </td>
    //         `;

    //         cols[9] = statusDropdown;

    //         const dataCells = [
    //             `<td>${index + 1}</td>`,
    //             ...cols.map((col, i) => i === 9 ? col : `<td>${col}</td>`)
    //         ].join("");

    //         return `<tr>${dataCells}</tr>`;
    //     }).join("");

    //     $("#tableBody").html(bodyHTML);
    //     $("#totalHadir").text(formatSummary(totalHadir, totalPeserta));
    //     $('#summaryKTM').text(`${hadirKtm} / ${hadirNon}`);
    //     $('#summaryAge').text(`${hadirBottomAge} / ${hadirMiddleAge} / ${hadirTopAge}`)

    //     bindDropdownEvents();

    //     // Inisialisasi DataTable
    //     if ($.fn.DataTable.isDataTable('#attendanceTable')) {
    //         $('#attendanceTable').DataTable().destroy();
    //     }

    //     let table = $('#attendanceTable').DataTable({
    //         pageLength: 5,
    //         lengthChange: true,
    //         lengthMenu: [5, 10, 25],
    //         searching: true,
    //         ordering: true,
    //         info: false,
    //         autoWidth: false,
    //         scrollX: true,
    //         dom: '<"top">rt<"bottom"lp>',  // length (l) + pagination (p) di bagian bawah
    //         columnDefs: [
    //         {
    //             targets: 9,
    //             width: '100px',
    //         },
    //         {
    //             targets: 10,
    //             orderable: false
    //         },
    //         {
    //             targets: 4,
    //             orderable: false
    //         },
    //         {
    //             targets: 3,
    //             visible: false
    //         },
    //         {
    //             targets: '_all',
    //             className: 'dt-center dt-head-center' // tengahkan header dan isi sel
    //         }
    //     ]
    //     });

    //     $("#searchInput").on("keyup change", function () {
    //         table.search(this.value).draw();
    //     });

    //     // Tombol sorting dengan DataTables API
    //     $("#sortNama").on("click", function () {
    //         if (table) {
    //             table.order([2, 'asc']).draw(); // Nama ada di index ke-2 (misalnya)
    //         }
    //     });

    //     $("#sortTimestamp").on("click", function () {
    //         if (table) {
    //             table.order([1, 'asc']).draw(); // Timestamp/No di index ke-1 (misalnya)
    //         }
    //     });

    //     $("#summaryCamping").on("click", function () {
    //         let summary = {
    //             "Belum Pernah": 0,
    //             "Pernah di Tumpang": 0,
    //             "Pernah di Cikanyere": 0,
    //             "Pernah di Bandol": 0
    //         };

    //         table.rows().every(function () {
    //             const $row = $(this.node());
    //             const camping = $row.find("td").eq(8).text().trim();

    //             if (summary.hasOwnProperty(camping)) {
    //                 summary[camping]++;
    //             }
    //         });

    //         const total = table.rows().count();
    //         const format = (value) => `${value} (${Math.round((value / total) * 100)}%)`;

    //         Swal.fire({
    //             icon: "info",
    //             title: "Data Peserta Camping",
    //             html: `
    //                 <ul style="text-align: left; line-height: 1.8;">
    //                     <li><strong>Belum Pernah:</strong> ${format(summary["Belum Pernah"])}</li>
    //                     <li><strong>Pernah di Tumpang:</strong> ${format(summary["Pernah di Tumpang"])}</li>
    //                     <li><strong>Pernah di Cikanyere:</strong> ${format(summary["Pernah di Cikanyere"])}</li>
    //                     <li><strong>Pernah di Bandol:</strong> ${format(summary["Pernah di Bandol"])}</li>
    //                 </ul>
    //             `,
    //             confirmButtonText: "Tutup"
    //         });
    //     });

    //     $('#addData').on("click", function () {
    //         Swal.fire({
    //             title: "Tambah Data Peserta",
    //             html: `
    //                 <div class="swal-form">
    //                     <label>Nama Peserta</label>
    //                     <input id="swal-nama" class="swal2-input custom-input" placeholder="Masukkan nama">

    //                     <label>Umur</label>
    //                     <select id="swal-umur" class="swal2-input custom-input">
    //                         <option value="" disabled selected>-- Masukan Range Usia --</option>
    //                         <option value="8-17 Tahun">8-17 Tahun</option>
    //                         <option value="18-25 Tahun">18-25 Tahun</option>
    //                         <option value="26-30 Tahun">26-30 Tahun</option>
    //                         <option value="31-40 Tahun">31-40 Tahun</option>
    //                         <option value=">41 Tahun">> 41 Tahun</option>
    //                     </select>

    //                     <label>Domisili</label>
    //                     <select id="swal-domisili" class="swal2-input custom-input">
    //                         <option value="" disabled selected>-- Pilih Domisili Anda --</option>
    //                         <option value="Jakarta Pusat">Jakarta Pusat</option>
    //                         <option value="Jakarta Barat">Jakarta Barat</option>
    //                         <option value="Jakarta Timur">Jakarta Timur</option>
    //                         <option value="Jakarta Utara">Jakarta Utara</option>
    //                         <option value="Jakarta Selatan">Jakarta Selatan</option>
    //                         <option value="Tangerang">Tangerang</option>
    //                         <option value="Bekasi">Bekasi</option>
    //                         <option value="other">Cibubur/Cianjur/Depok</option>
    //                     </select>

    //                     <label>Keanggotaan</label>
    //                     <select id="swal-keanggotaan" class="swal2-input custom-input">
    //                         <option value="" disabled selected>-- Sudah Join KTM ? --</option>
    //                         <option value="Belum Bergabung KTM">Belum Bergabung KTM</option>
    //                         <option value="Sudah Bergabung KTM">Sudah Bergabung KTM</option>
    //                     </select>

    //                     <label>Status Kehadiran</label>
    //                     <select id="swal-status" class="swal2-input custom-input">
    //                         <option>Hadir</option>
    //                     </select>
    //                 </div>
    //             `,
    //             focusConfirm: false,
    //             confirmButtonText: "Simpan",
    //             showCancelButton: true,
    //             cancelButtonText: "Batal",
    //             customClass: {
    //                 popup: 'swal-wide'
    //             },
    //             preConfirm: () => {
    //                 const nama = $("#swal-nama").val().trim();
    //                 const umur = $("#swal-umur").length ? $("#swal-umur").val() : '';
    //                 const domisili = $("#swal-domisili").length ? $('#swal-domisili').val() : '';
    //                 const keanggotaan = $("#swal-keanggotaan").length ? $("#swal-keanggotaan").val() : '';
    //                 const camping = 'OTS';
    //                 const status = $("#swal-status").val();

    //                 if (!nama || !umur || !domisili || !keanggotaan || !camping) {
    //                     Swal.showValidationMessage("⚠ Semua field wajib diisi!");
    //                     return false;
    //                 }

    //                 return { nama, umur, domisili, keanggotaan, camping, status };
    //             }
    //         }).then((result) => {
    //             if(result.isConfirmed) {
    //                 const { nama, umur, domisili, keanggotaan, camping, status } = result.value;

    //                 Swal.fire({
    //                     title: 'Menyimpan data...',
    //                     text: 'Harap tunggu sebentar.',
    //                     allowOutsideClick: false,
    //                     allowEscapeKey: false,
    //                     didOpen: () => {
    //                         Swal.showLoading();
    //                     }
    //                 });

    //                 const normalizedPhone = "-";
    //                 const formData = {
    //                     name: nama,
    //                     email: "-",
    //                     phone: normalizedPhone,
    //                     age: umur,
    //                     domicile: domisili,
    //                     member: keanggotaan,
    //                     media: "Social Media",
    //                     camping: camping,
    //                     message: status
    //                 };

    //                 const scriptURL = "https://script.google.com/macros/s/AKfycbwxfuW3mxaw5ctAVSJrKpJsPJDZimh69I1kuHP9Ddo8nK_34CvKY-kLUVJTM-SgKBykxw/exec";

    //                 $.post(scriptURL, formData)
    //                 .done(function() {
    //                     Swal.fire({
    //                         title: "Berhasil!",
    //                         text: "Data berhasil disimpan.",
    //                         icon: "success"
    //                     }).then(() => {
    //                         window.location.reload();
    //                     });
    //                 })
    //                 .fail(function() {
    //                     Swal.fire({
    //                         title: "Gagal!",
    //                         text: "Terjadi kesalahan saat mengirim data.",
    //                         icon: "error"
    //                     });
    //                 })
    //             }
    //         });
    //     });
    // }
    
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

            // Summary KTM
            if (keanggotaan === "sudah bergabung ktm") {
                if (statusText === "Hadir") hadirKtm++;
            } else if (keanggotaan === "belum bergabung ktm") {
                if (statusText === "Hadir") hadirNon++;
            }

            // Summary Umur
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

        // Tampilkan ringkasan
        $("#totalHadir").text(formatSummary(totalHadir, totalPeserta));
        $("#summaryKTM").text(`${hadirKtm} / ${hadirNon}`);
        $("#summaryAge").text(`${hadirBottomAge} / ${hadirMiddleAge} / ${hadirTopAge}`);

        // Hapus instance DataTable jika ada
        if ($.fn.DataTable.isDataTable('#attendanceTable')) {
            $('#attendanceTable').DataTable().destroy();
        }

        // Inisialisasi ulang DataTable
        let table = $('#attendanceTable').DataTable({
            pageLength: 5,
            lengthChange: true,
            lengthMenu: [5, 10, 25],
            searching: true,
            ordering: true,
            info: false,
            autoWidth: false,
            scrollX: true,
            dom: '<"top">rt<"bottom"lp>',
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
                    className: 'dt-center dt-head-center'
                }
            ]
        });

        // ✅ Tambahkan bindDropdownEvents setelah DataTables draw
        table.on('draw', function () {
            bindDropdownEvents(); // ← ini kunci perbaikannya!
        });

        // Panggil awal agar dropdown langsung aktif
        bindDropdownEvents();

        // Fungsi pencarian manual
        $("#searchInput").on("keyup change", function () {
            table.search(this.value).draw();
        });

        // Tombol sorting
        $("#sortNama").on("click", function () {
            if (table) {
                table.order([2, 'asc']).draw(); // Nama di index ke-2
            }
        });

        $("#sortTimestamp").on("click", function () {
            if (table) {
                table.order([1, 'asc']).draw(); // Timestamp di index ke-1
            }
        });

        // Ringkasan Camping
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
                // success: () => Swal.fire({
                //     icon: "success",
                //     title: "Berhasil!",
                //     text: "Status diperbarui."
                // }),
                success: () => {
                    Swal.fire({
                        icon: "success",
                        title: "Berhasil!",
                        text: "Status berhasil diperbarui."
                    }).then(() => {
                        window.location.reload();
                    });
                },
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

    setInterval(() => {
        $.get(url, function (data) {
            const parsed = Papa.parse(data.trim(), { skipEmptyLines: true });
            const rows = parsed.data.map(cols => cols.map(col => col.trim()));
            const newRows = rows.slice(1); // Buang header

            let dataBerubah = false;

            if (newRows.length !== originalRows.length) {
                dataBerubah = true;
            } else {
                for (let i = 0; i < newRows.length; i++) {
                    if (originalRows[i][9] !== newRows[i][9]) {
                        dataBerubah = true;
                        break;
                    }
                }
            }

            if (dataBerubah) {
                originalRows = newRows;
                renderTable(originalRows);
            }
        });
    }, 30000); // setiap 30 detik
});

