import { getTransactionHistory } from "@/actions/transactions";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"; // Assure-toi d'avoir lucide-react

export const metadata = {
  title: "Transactions | Kodfi",
};

export default async function TransactionsPage() {
  const transactions = await getTransactionHistory();

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Relevé de Compte
        </h2>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Description
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Date
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Statut
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white text-right">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-5 text-center text-gray-500">
                    Aucune transaction pour le moment.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    {/* COLONNE DESCRIPTION */}
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                      <div className="flex flex-col gap-1">
                        <h5 className="font-medium text-black dark:text-white">
                            {tx.label}
                        </h5>
                        <p className="text-xs text-gray-500">{tx.details}</p>
                        {/* Affiche la commission si c'est une vente */}
                        {tx.type === "CREDIT" && (
                             <span className="text-[10px] text-gray-400">
                                Prix client: {tx.rawAmount}F (Commission déduite)
                             </span>
                        )}
                      </div>
                    </td>

                    {/* COLONNE DATE */}
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white text-sm">
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </td>

                    {/* COLONNE STATUT */}
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p
                        className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                          tx.status === "COMPLETED" || tx.status === "PROCESSED"
                            ? "bg-success text-success"
                            : tx.status === "PENDING"
                            ? "bg-warning text-warning"
                            : "bg-danger text-danger"
                        }`}
                      >
                        {tx.status === "PENDING" ? "En attente" : 
                         tx.status === "PROCESSED" ? "Payé" : 
                         tx.status === "COMPLETED" ? "Succès" : "Échoué"}
                      </p>
                    </td>

                    {/* COLONNE MONTANT */}
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-right">
                      <div className="flex items-center justify-end gap-2 font-medium">
                         {tx.type === "CREDIT" ? (
                             <>
                                <ArrowDownLeft size={16} className="text-success" />
                                <span className="text-success">+{tx.amount} F</span>
                             </>
                         ) : (
                             <>
                                <ArrowUpRight size={16} className="text-danger" />
                                <span className="text-danger">-{tx.amount} F</span>
                             </>
                         )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}