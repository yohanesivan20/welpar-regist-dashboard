$(document).ready(function () {
    $("#loginForm").on("submit", function (e) {
        e.preventDefault();
        const username = $('#username').val().trim();
        const password = $("#password").val();

        $.ajax({
            url: "/api/login",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ username, password }),
            beforeSend: function () {
                Swal.fire({
                    title: "Memproses...",
                    text: "Sedang melakukan pengecekan password",
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            },
            success: function (data) {
                Swal.close(); // tutup loading

                if (data.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Login Berhasil!",
                        text: "Silahkan akses dashboard!"
                    });

                    $("#login-section").hide();
                    $("#dashboard").show();
                    $('#attendanceTable').DataTable().columns.adjust().draw();
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Login Gagal!",
                        text: data.message || "Password salah!"
                    });
                }
            },
            error: function (xhr, status, error) {
                Swal.close();
                Swal.fire({
                    icon: "error",
                    title: "Terjadi Kesalahan!",
                    text: "Gagal menghubungi server: " + error
                });
            }
        });
    });
});