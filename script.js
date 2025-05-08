
document.addEventListener('DOMContentLoaded', (event) => {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Welcome to Your App</h1>
    <button id="actionButton">Click Me!</button>
  `;

  document.body.appendChild(container);

  const button = document.getElementById('actionButton');
  button.addEventListener('click', () => {
    alert('Button clicked!');
  });
});
