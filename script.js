<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calculadora de Amortización Profesional</title>
    <style>
        :root {
            --bg-color: #f4f7f6;
            --card-bg: #ffffff;
            --primary: #2c3e50;
            --accent: #3498db;
            --text: #333333;
            --border: #e2e8f0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text);
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
        }

        .container {
            width: 100%;
            max-width: 1000px;
            background: var(--card-bg);
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        h1 {
            text-align: center;
            color: var(--primary);
            margin-bottom: 30px;
            font-weight: 600;
        }

        .grid-inputs {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
        }

        label {
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--primary);
        }

        input, select {
            padding: 10px;
            border: 1px solid var(--border);
            border-radius: 6px;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.2s;
        }

        input:focus, select:focus {
            border-color: var(--accent);
        }

        button {
            grid-column: 1 / -1;
            padding: 12px;
            background-color: var(--accent);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s;
        }

        button:hover {
            background-color: #2980b9;
        }

        .results-section {
            margin-top: 35px;
        }

        .table-responsive {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            text-align: left;
        }

        th, td {
            padding: 12px 15px;
            border-bottom: 1px solid var(--border);
        }

        th {
            background-color: var(--primary);
            color: white;
            font-weight: 500;
        }

        tr:hover {
            background-color: #f8fafc;
        }

        .text-right {
            text-align: right;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Core Financiero: Motor de Amortización</h1>
    
    <div class="grid-inputs">
        <div class="form-group">
            <label for="assetValue">Valor del Activo ($)</label>
            <input type="number" id="assetValue" placeholder="Ej. 10000" min="1" step="any" value="10000">
        </div>
        
        <div class="form-group">
            <label for="periods">Plazo (Meses)</label>
            <input type="number" id="periods" placeholder="Ej. 12" min="1" value="12">
        </div>
        
        <div class="form-group">
            <label for="interestRate">Tasa de Interés Mensual (%)</label>
            <input type="number" id="interestRate" placeholder="Ej. 2" min="0" step="any" value="2">
        </div>
        
        <div class="form-group">
            <label for="systemType">Sistema de Amortización</label>
            <select id="systemType">
                <option value="french">Francés (Cuota Fija)</option>
                <option value="linear">Lineal / Alemán (Amortización Fija)</option>
                <option value="regressive">Regresivo / Americano (Interés Fijo, Capital al final)</option>
            </select>
        </div>
        
        <button onclick="generarTabla()">Calcular Tabla de Amortización</button>
    </div>

    <div class="results-section">
        <div class="table-responsive">
            <table id="amortizationTable">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th class="text-right">Cuota</th>
                        <th class="text-right">Interés</th>
                        <th class="text-right">Amortización (Capital)</th>
                        <th class="text-right">Saldo Pendiente</th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                    </tbody>
            </table>
        </div>
    </div>
</div>

<script>
    // Formateador de moneda centralizado
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });

    function generarTabla() {
        const principal = parseFloat(document.getElementById('assetValue').value);
        const periods = parseInt(document.getElementById('periods').value);
        const rate = parseFloat(document.getElementById('interestRate').value) / 100;
        const system = document.getElementById('systemType').value;
        
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = ''; // Resetear tabla anterior

        // Validaciones de seguridad de tipado de datos
        if (isNaN(principal) || isNaN(periods) || isNaN(rate) || principal <= 0 || periods <= 0 || rate < 0) {
            alert("Por favor, introduce valores numéricos válidos y mayores a cero.");
            return;
        }

        let schedule = [];

        // Engine de cálculo según patrón de diseño arquitectónico
        switch (system) {
            case 'french':
                schedule = calcularSistemaFrances(principal, periods, rate);
                break;
            case 'linear':
                schedule = calcularSistemaLineal(principal, periods, rate);
                break;
            case 'regressive':
                schedule = calcularSistemaRegresivo(principal, periods, rate);
                break;
        }

        // Renderizado eficiente en el DOM
        schedule.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.periodo}</td>
                <td class="text-right">${formatter.format(row.cuota)}</td>
                <td class="text-right">${formatter.format(row.interes)}</td>
                <td class="text-right">${formatter.format(row.amortizacion)}</td>
                <td class="text-right">${formatter.format(row.saldo)}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- MOTORES MATEMÁTICOS DE CÁLCULO ---

    function calcularSistemaFrances(principal, periods, rate) {
        let rows = [];
        let saldo = principal;
        // Fórmula de la cuota fija: C = P * [i * (1+i)^n] / [(1+i)^n - 1]
        let cuota = rate === 0 ? principal / periods : principal * (rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1);

        for (let i = 1; i <= periods; i++) {
            let interes = saldo * rate;
            let amortizacion = cuota - interes;
            saldo -= amortizacion;
            
            // Corrección de redondeo flotante en el último período
            if (i === periods) {
                amortizacion += saldo;
                cuota = amortizacion + interes;
                saldo = 0;
            }

            rows.push({ periodo: i, cuota, interes, amortizacion, saldo: Math.max(0, saldo) });
        }
        return rows;
    }

    function calcularSistemaLineal(principal, periods, rate) {
        let rows = [];
        let saldo = principal;
        // Amortización constante del capital
        let amortizacion = principal / periods;

        for (let i = 1; i <= periods; i++) {
            let interes = saldo * rate;
            let cuota = amortizacion + interes;
            saldo -= amortizacion;

            if (i === periods) {
                saldo = 0;
            }

            rows.push({ periodo: i, cuota, interes, amortizacion, saldo: Math.max(0, saldo) });
        }
        return rows;
    }

    function calcularSistemaRegresivo(principal, periods, rate) {
        let rows = [];
        let saldo = principal;

        for (let i = 1; i <= periods; i++) {
            let interes = saldo * rate;
            let amortizacion = (i === periods) ? principal : 0; // El capital se paga por completo al final
            let cuota = amortizacion + interes;
            
            if (i === periods) {
                saldo = 0;
            }

            rows.push({ periodo: i, cuota, interes, amortizacion, saldo: Math.max(0, saldo) });
        }
        return rows;
    }

    // Render inicial por defecto al cargar la app
    window.onload = generarTabla;
</script>

</body>
</html>