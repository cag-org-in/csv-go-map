$(document).ready(function() {
  $('#example').DataTable();

  $('form select').on('change', () => {
    let foundProblem = false;
    let x_col = $('#x_col').val(),
        y_col = $('#y_col').val();
    if (x_col == y_col) {
      foundProblem = true;
    }
    rows.forEach(row => {
      let x_val = row[x_col],
          y_val = row[y_col];
      if (y_val < 7.16 || y_val > 38.02) {
        $('label.problem.y').show();
        foundProblem = true;
      } else {
        $('label.problem.y').hide();
      }
      if (x_val < 67.6198005 || x_val > 97.996748) {
        $('label.problem.x').show();
        foundProblem = true;
      } else {
        $('label.problem.x').hide();
      }
    });
    if (!foundProblem) {
      $('form input').attr('disabled', false);
    } else {
      $('form input').attr('disabled', true);
    }
  });
});
