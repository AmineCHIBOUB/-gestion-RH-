<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bulletin de Paie</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .company-info {
            text-align: left;
            margin-bottom: 20px;
        }
        .employee-info {
            margin-bottom: 30px;
        }
        .salary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .salary-table th, .salary-table td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
        }
        .salary-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>BULLETIN DE PAIE</h1>
        <h2>{{ $periode['mois_nom'] }} {{ $periode['annee'] }}</h2>
    </div>

    <div class="company-info">
        <strong>Entreprise:</strong> Votre Entreprise<br>
        <strong>Adresse:</strong> Adresse de l'entreprise<br>
        <strong>SIRET:</strong> 123 456 789 00012
    </div>

    <div class="employee-info">
        <h3>Informations Employé</h3>
        <strong>Nom:</strong> {{ $user->nom }} {{ $user->prenom }}<br>
        <strong>Email:</strong> {{ $user->email }}<br>
        <strong>Poste:</strong> {{ $post->titre ?? 'N/A' }}<br>
        <strong>Département:</strong> {{ $department->name ?? 'N/A' }}<br>
        <strong>Période:</strong> {{ $periode['mois_nom'] }} {{ $periode['annee'] }}
    </div>

    <table class="salary-table">
        <thead>
            <tr>
                <th>Désignation</th>
                <th>Base</th>
                <th>Taux</th>
                <th>Montant</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Salaire de base</td>
                <td>{{ $bulletin->heures_travaillees }}h</td>
                <td>-</td>
                <td>{{ number_format($bulletin->salaire_base, 2) }} €</td>
            </tr>
            @if($bulletin->primes > 0)
            <tr>
                <td>Primes</td>
                <td>-</td>
                <td>-</td>
                <td>{{ number_format($bulletin->primes, 2) }} €</td>
            </tr>
            @endif
            @if($bulletin->bonus > 0)
            <tr>
                <td>Bonus</td>
                <td>-</td>
                <td>-</td>
                <td>{{ number_format($bulletin->bonus, 2) }} €</td>
            </tr>
            @endif
            <tr class="total-row">
                <td><strong>Salaire Brut</strong></td>
                <td>-</td>
                <td>-</td>
                <td><strong>{{ number_format($salaire_brut, 2) }} €</strong></td>
            </tr>
            <tr>
                <td>Cotisations sociales</td>
                <td>-</td>
                <td>-</td>
                <td>-{{ number_format($bulletin->cotisations_sociales, 2) }} €</td>
            </tr>
            <tr>
                <td>Impôts</td>
                <td>-</td>
                <td>-</td>
                <td>-{{ number_format($bulletin->impots, 2) }} €</td>
            </tr>
            @if($bulletin->deductions > 0)
            <tr>
                <td>Autres déductions</td>
                <td>-</td>
                <td>-</td>
                <td>-{{ number_format($bulletin->deductions, 2) }} €</td>
            </tr>
            @endif
            <tr class="total-row">
                <td><strong>Total Déductions</strong></td>
                <td>-</td>
                <td>-</td>
                <td><strong>-{{ number_format($total_deductions, 2) }} €</strong></td>
            </tr>
            <tr class="total-row" style="background-color: #e8f5e8;">
                <td><strong>SALAIRE NET</strong></td>
                <td>-</td>
                <td>-</td>
                <td><strong>{{ number_format($bulletin->salaire_net, 2) }} €</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>Bulletin généré le {{ date('d/m/Y à H:i') }}</p>
        <p>Ce document est confidentiel et ne doit pas être divulgué à des tiers.</p>
    </div>
</body>
</html>