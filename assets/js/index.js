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
            if (selected === "Sudah Absen") {
            row.addClass("sudah-absen");
            } else {
            row.removeClass("sudah-absen");
            }
        });
    });

    function updateStatus(rowIndex, value) {
    const sheetId = "1FrCJK0o2_Dbj_xqAB30CNGOpLeIYPzKtnsXezkwA7NE";
    const apiKey = "AKfycbwxfuW3mxaw5ctAVSJrKpJsPJDZimh69I1kuHP9Ddo8nK_34CvKY-kLUVJTM-SgKBykxw"; // ini untuk membaca
    const accessToken = "TOKEN_SERVICE_ACCOUNT"; // untuk menulis
    
    $.ajax({
        url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!E${rowIndex}?valueInputOption=USER_ENTERED`,
        type: "PUT",
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        contentType: "application/json",
        data: JSON.stringify({
            values: [[value]]
        }),
        success: function() {
            console.log("Status updated!");
        }
    });
}
});